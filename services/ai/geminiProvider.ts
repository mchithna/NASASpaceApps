import type {
  AiProvider,
  ChatRequestOptions,
  ChatResponse,
  TtsRequestOptions,
  TtsResponse,
} from './types.ts'
import {
  buildSystemPrompt,
  getGroundingSources,
  generateSuggestedQuestions,
} from './grounding.ts'
import { sanitizeAiOutput, sanitizeHistory } from './safety.ts'

const CHAT_MODEL = 'gemini-3.5-flash'
const FALLBACK_CHAT_MODEL = 'gemini-3.5-flash-lite'
const TTS_MODEL = 'gemini-3.8-flash-tts'
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

export class GeminiProvider implements AiProvider {
  public readonly name = 'Google Gemini (Verified Educational Inference)'
  private apiKeys: string[] = []
  private currentKeyIndex = 0

  constructor(customKeys?: string[]) {
    if (customKeys && customKeys.length > 0) {
      this.apiKeys = customKeys.filter(Boolean)
    } else {
      const env = (
        globalThis as unknown as {
          process?: { env?: Record<string, string | undefined> }
        }
      ).process?.env
      const k1 = env?.GEMINI_API_KEY_1
      const k2 = env?.GEMINI_API_KEY_2
      const k3 = env?.GEMINI_API_KEY_3
      this.apiKeys = [k1, k2, k3].filter((k): k is string => Boolean(k && k.trim()))
    }
  }

  public isAvailable(): boolean {
    return this.apiKeys.length > 0
  }

  private getKey(): string {
    if (this.apiKeys.length === 0) {
      throw new Error(
        'No Gemini API keys configured. Set GEMINI_API_KEY_1, GEMINI_API_KEY_2, or GEMINI_API_KEY_3.',
      )
    }
    const key = this.apiKeys[this.currentKeyIndex % this.apiKeys.length]
    return key
  }

  private rotateKey(): void {
    if (this.apiKeys.length > 1) {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length
    }
  }

  public async generateChat(
    options: ChatRequestOptions,
    signal?: AbortSignal,
  ): Promise<ChatResponse> {
    const systemPrompt = buildSystemPrompt({
      missionId: options.missionId,
      simple: options.simple,
      persona: options.persona,
      contextData: options.contextData,
    })

    const sanitizedHistory = sanitizeHistory(options.messages)
    const contents = sanitizedHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

    const body = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: options.simple ? 0.3 : 0.6,
        maxOutputTokens: 1024,
      },
    }

    let lastError: Error | null = null
    const modelsToTry = [CHAT_MODEL, FALLBACK_CHAT_MODEL]

    for (const model of modelsToTry) {
      for (let attempt = 0; attempt < this.apiKeys.length; attempt++) {
        const key = this.getKey()
        try {
          const url = `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${key}`
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal,
          })

          if (response.status === 429 || response.status === 403) {
            this.rotateKey()
            continue
          }

          if (!response.ok) {
            const errJson = (await response.json().catch(() => ({}))) as {
              error?: { message?: string }
            }
            throw new Error(
              errJson.error?.message ?? `Gemini error ${response.status}`,
            )
          }

          const data = (await response.json()) as {
            candidates?: Array<{
              content?: {
                parts?: Array<{ text?: string }>
              }
            }>
          }
          const rawText =
            data.candidates?.[0]?.content?.parts?.[0]?.text ??
            'I could not generate an answer at this time.'
          const content = sanitizeAiOutput(rawText)

          const lastUserMessage = [...sanitizedHistory]
            .reverse()
            .find((m) => m.role === 'user')?.content

          const sources = getGroundingSources(
            options.missionId,
            lastUserMessage,
          )
          const suggestedQuestions = generateSuggestedQuestions(
            options.missionId,
          )

          return {
            content,
            sources,
            suggestedQuestions,
            isLive: true,
            model,
          }
        } catch (err: unknown) {
          lastError = err as Error
          this.rotateKey()
        }
      }
    }

    throw (
      lastError ??
      new Error('Failed to generate response after rotating through available keys.')
    )
  }

  public async streamChat(
    options: ChatRequestOptions,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal,
  ): Promise<ChatResponse> {
    const systemPrompt = buildSystemPrompt({
      missionId: options.missionId,
      simple: options.simple,
      persona: options.persona,
      contextData: options.contextData,
    })

    const sanitizedHistory = sanitizeHistory(options.messages)
    const contents = sanitizedHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

    const body = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: options.simple ? 0.3 : 0.6,
        maxOutputTokens: 1024,
      },
    }

    let fullText = ''
    const key = this.getKey()
    const url = `${GEMINI_BASE_URL}/models/${CHAT_MODEL}:streamGenerateContent?alt=sse&key=${key}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    })

    if (!response.ok) {
      return this.generateChat(options, signal)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      return this.generateChat(options, signal)
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim()
          if (!jsonStr || jsonStr === '[DONE]') continue
          try {
            const parsed = JSON.parse(jsonStr)
            const chunkText =
              parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
            if (chunkText) {
              const sanitizedChunk = sanitizeAiOutput(chunkText)
              fullText += sanitizedChunk
              onChunk(sanitizedChunk)
            }
          } catch {
            // Partial or malformed SSE line, keep buffering
          }
        }
      }
    }

    const lastUserMessage = [...sanitizedHistory]
      .reverse()
      .find((m) => m.role === 'user')?.content

    const sources = getGroundingSources(options.missionId, lastUserMessage)
    const suggestedQuestions = generateSuggestedQuestions(
      options.missionId,
    )

    return {
      content: fullText || 'No response generated.',
      sources,
      suggestedQuestions,
      isLive: true,
      model: CHAT_MODEL,
    }
  }

  public async synthesizeSpeech(
    options: TtsRequestOptions,
    signal?: AbortSignal,
  ): Promise<TtsResponse> {
    const key = this.getKey()
    const url = `${GEMINI_BASE_URL}/models/${TTS_MODEL}:generateContent?key=${key}`

    // Clean text for speech: remove markdown syntax, links, emojis
    const cleanText = options.text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_#`~>]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 500)

    const body = {
      contents: [{ parts: [{ text: cleanText }] }],
      generationConfig: {
        responseMimeType: 'audio/wav',
      },
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      throw new Error(`TTS synthesis error: ${response.status} ${errText}`)
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            inlineData?: {
              mimeType?: string
              data?: string
            }
          }>
        }
      }>
    }
    const part = data.candidates?.[0]?.content?.parts?.[0]
    const audioData = part?.inlineData?.data

    if (!audioData) {
      throw new Error('TTS response did not contain audio data.')
    }

    return {
      audioBase64: audioData,
      mimeType: part?.inlineData?.mimeType ?? 'audio/wav',
    }
  }
}

let defaultProviderInstance: GeminiProvider | null = null

export function getAiProvider(): GeminiProvider {
  if (!defaultProviderInstance) {
    defaultProviderInstance = new GeminiProvider()
  }
  return defaultProviderInstance
}
