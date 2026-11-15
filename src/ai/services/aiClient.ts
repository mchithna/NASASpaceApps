import type { GroundingSource } from '../types.ts'
import { answerLocally } from '../knowledge.ts'

export interface SendMessageOptions {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  simple?: boolean
  route?: string
  missionId?: string
  stream?: boolean
  persona?: 'guide' | 'commander' | 'copilot'
  contextData?: {
    rank?: string
    xp?: number
    completedMissions?: string[]
    currentSceneTitle?: string
    currentSceneType?: string
  }
  signal?: AbortSignal
  onChunk?: (chunk: string) => void
}

export interface SendMessageResult {
  content: string
  sources: GroundingSource[]
  suggestedQuestions: string[]
  isLive: boolean
  model: string
}

export interface TtsResult {
  audioBase64: string
  mimeType: string
}

export async function checkAiHealth(): Promise<{
  isConfigured: boolean
  provider: string
}> {
  try {
    const res = await fetch('/api/ai/health')
    if (!res.ok) return { isConfigured: false, provider: 'Offline' }
    const data = (await res.json()) as {
      isConfigured: boolean
      provider: string
    }
    return data
  } catch {
    return { isConfigured: false, provider: 'Offline' }
  }
}

export async function sendChatMessage(
  options: SendMessageOptions,
): Promise<SendMessageResult> {
  const lastUserMsg = [...options.messages]
    .reverse()
    .find((m) => m.role === 'user')?.content

  try {
    // If streaming is requested and onChunk is provided
    if (options.stream && options.onChunk) {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...options, stream: true }),
        signal: options.signal,
      })

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('ReadableStream not supported')
      }

      const decoder = new TextDecoder()
      let fullContent = ''
      let sources: GroundingSource[] = []
      let suggestedQuestions: string[] = []
      let model = 'gemini-3.5-flash'
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
              const data = JSON.parse(jsonStr) as {
                chunk?: string
                done?: boolean
                sources?: GroundingSource[]
                suggestedQuestions?: string[]
                model?: string
              }
              if (data.chunk) {
                fullContent += data.chunk
                options.onChunk(data.chunk)
              }
              if (data.done) {
                if (data.sources) sources = data.sources
                if (data.suggestedQuestions)
                  suggestedQuestions = data.suggestedQuestions
                if (data.model) model = data.model
              }
            } catch {
              // Ignore partial JSON
            }
          }
        }
      }

      return {
        content: fullContent,
        sources,
        suggestedQuestions,
        isLive: true,
        model,
      }
    }

    // Standard non-streaming fetch
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
      signal: options.signal,
    })

    if (!response.ok) {
      const err = (await response.json().catch(() => ({}))) as {
        error?: string
      }
      throw new Error(err.error || `Server error: ${response.status}`)
    }

    const data = (await response.json()) as SendMessageResult
    return data
  } catch (err: unknown) {
    if ((err as Error).name === 'AbortError') {
      throw err
    }

    // Graceful offline fallback using reviewed NASA source guide
    if (lastUserMsg) {
      const local = answerLocally(lastUserMsg, options.simple ?? false)
      return {
        content: local.text,
        sources: local.source
          ? [
              {
                title: local.source.title,
                url: local.source.url,
                relevance: 'Offline NASA Reference',
              },
            ]
          : [],
        suggestedQuestions: [
          'What happened to Opportunity on Mars?',
          'How did Ingenuity fly in thin air?',
          'What did Apollo 12 find on Surveyor 3?',
        ],
        isLive: false,
        model: 'Source Guide Fallback',
      }
    }

    throw err
  }
}

export async function synthesizeSpeech(
  text: string,
  signal?: AbortSignal,
): Promise<TtsResult> {
  const response = await fetch('/api/ai/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    signal,
  })

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error || `TTS error: ${response.status}`)
  }

  const data = (await response.json()) as TtsResult
  return data
}
