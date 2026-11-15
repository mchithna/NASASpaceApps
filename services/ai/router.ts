import { getAiProvider } from './geminiProvider.ts'
import { checkRateLimit } from './rateLimit.ts'
import { validateUserInput } from './safety.ts'
import type { ChatRequestOptions, TtsRequestOptions } from './types.ts'

export interface ServerRequest {
  url?: string
  method?: string
  headers: Record<string, string | string[] | undefined>
  socket: { remoteAddress?: string }
  on(event: 'data', listener: (chunk: { toString(): string } | string) => void): this
  on(event: 'end', listener: () => void): this
  on(event: 'error', listener: (err: Error) => void): this
}

export interface ServerResponse {
  statusCode: number
  setHeader(name: string, value: string): void
  write(chunk: string): boolean
  end(chunk?: string): void
}

export async function handleAiRequest(
  req: ServerRequest,
  res: ServerResponse,
): Promise<void> {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('X-Content-Type-Options', 'nosniff')

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  const url = req.url || ''
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    '127.0.0.1'

  // Health check endpoint
  if (url.startsWith('/api/ai/health') && req.method === 'GET') {
    const provider = getAiProvider()
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        status: 'ok',
        provider: provider.name,
        isConfigured: provider.isAvailable(),
      }),
    )
    return
  }

  // Rate limiting check
  const rateLimit = checkRateLimit(clientIp, 30, 60000)
  if (!rateLimit.allowed) {
    res.statusCode = 429
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Retry-After', Math.ceil(rateLimit.resetMs / 1000).toString())
    res.end(
      JSON.stringify({
        error:
          'Rate limit reached. Please wait a moment before sending more messages to Nova.',
      }),
    )
    return
  }

  // Read request body helper
  const readBody = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      let data = ''
      req.on('data', (chunk) => {
        data += chunk
        if (data.length > 50000) {
          reject(new Error('Payload too large'))
        }
      })
      req.on('end', () => resolve(data))
      req.on('error', reject)
    })
  }

  // TTS endpoint
  if (url.startsWith('/api/ai/tts') && req.method === 'POST') {
    try {
      const rawBody = await readBody()
      const body = JSON.parse(rawBody) as TtsRequestOptions
      if (!body.text || typeof body.text !== 'string') {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Text is required for TTS.' }))
        return
      }

      const provider = getAiProvider()
      const ttsResult = await provider.synthesizeSpeech(body)
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(ttsResult))
      return
    } catch (err: unknown) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: (err as Error).message || 'TTS synthesis failed.',
        }),
      )
      return
    }
  }

  // Chat endpoint
  if (url.startsWith('/api/ai/chat') && req.method === 'POST') {
    try {
      const rawBody = await readBody()
      const body = JSON.parse(rawBody) as ChatRequestOptions

      if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Messages array is required.' }))
        return
      }

      const lastUserMsg = [...body.messages]
        .reverse()
        .find((m) => m.role === 'user')

      if (!lastUserMsg) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'A user message is required.' }))
        return
      }

      const validation = validateUserInput(lastUserMsg.content)
      if (!validation.valid) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: validation.error }))
        return
      }

      lastUserMsg.content = validation.sanitized
      const provider = getAiProvider()

      // Handle streaming SSE
      if (body.stream) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')

        await provider.streamChat(body, (chunk) => {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`)
        })

        // Final payload with sources and metadata
        const finalResult = await provider.generateChat(body)
        res.write(
          `data: ${JSON.stringify({
            done: true,
            sources: finalResult.sources,
            suggestedQuestions: finalResult.suggestedQuestions,
            model: finalResult.model,
          })}\n\n`,
        )
        res.end()
        return
      }

      // Non-streaming response
      const result = await provider.generateChat(body)
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(result))
      return
    } catch (err: unknown) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: (err as Error).message || 'AI request failed.',
        }),
      )
      return
    }
  }

  res.statusCode = 404
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ error: 'Not found' }))
}
