/**
 * Serverless API Route: /api/chat
 * Handles conversational queries for Nova AI using Vercel AI Gateway.
 * Keeps API keys private and enforces rate limiting, length checks, and streaming responses.
 */

import { buildNovaSystemPrompt } from '../src/ai/nova-system-prompt.ts'

export const config = {
  runtime: 'edge',
}

// In-memory rate limiting map: ip -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window
  const maxRequests = 20

  const record = rateLimitMap.get(ip)
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 1. Rate limiting by IP
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'

  if (!checkRateLimit(clientIp)) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please wait a minute before asking again.',
        code: 'RATE_LIMIT',
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  // 2. Parse and validate input
  let body: {
    messages?: Array<{ role: string; text?: string; content?: string }>
    mission?: string
    route?: string
    simulateError?: boolean
  }

  try {
    body = (await request.json()) as typeof body
  } catch {
    return new Response(
      JSON.stringify({
        error: 'Invalid JSON payload in request body.',
        code: 'BAD_REQUEST',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // Support intentional test simulation
  if (body.simulateError) {
    return new Response(
      JSON.stringify({
        error:
          'Simulated server error. Check your connection or try again in a moment.',
        code: 'SIMULATED_ERROR',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { messages, mission, route } = body

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({
        error: 'Messages list is required and cannot be empty.',
        code: 'EMPTY_MESSAGES',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // Validate message length (< 1,000 characters)
  for (const m of messages) {
    const text = m.text || m.content || ''
    if (text.length > 1000) {
      return new Response(
        JSON.stringify({
          error:
            'Message exceeds 1,000 characters limit. Please shorten your question.',
          code: 'MESSAGE_TOO_LONG',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }
  }

  // Cap to last 12 messages only
  const history = messages.slice(-12).map((m) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.text || m.content || '',
  }))

  const systemPrompt = buildNovaSystemPrompt(mission, route)

  // 3. Environment Variables
  const apiKey = process.env.AI_GATEWAY_API_KEY
  const model = process.env.NOVA_MODEL || 'openai/gpt-4o-mini'
  const gatewayUrl =
    process.env.AI_GATEWAY_URL ||
    'https://ai-gateway.vercel.sh/v1/chat/completions'

  // If no API key is configured yet, stream simulated tokens from local knowledge
  if (!apiKey) {
    const lastQuestion = history[history.length - 1]?.content || ''
    return createSimulatedStreamResponse(lastQuestion)
  }

  // 4. Query Vercel AI Gateway with streaming
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    const upstreamResponse = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...history],
        stream: true,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (upstreamResponse.status === 429) {
      return new Response(
        JSON.stringify({
          error:
            'AI rate limit reached. Please wait a moment before sending your next message.',
          code: 'RATE_LIMIT',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      )
    }

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      return new Response(
        JSON.stringify({
          error:
            'Nova service is temporarily unavailable. Please try again shortly.',
          code: 'GATEWAY_ERROR',
        }),
        {
          status: upstreamResponse.status || 502,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // Transform SSE stream into clean token stream
    const reader = upstreamResponse.body.getReader()
    const decoder = new TextDecoder()
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(streamController) {
        let buffer = ''
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed || !trimmed.startsWith('data: ')) continue
              if (trimmed === 'data: [DONE]') continue

              try {
                const data = JSON.parse(trimmed.slice(6))
                const token = data.choices?.[0]?.delta?.content
                if (token) {
                  streamController.enqueue(encoder.encode(token))
                }
              } catch {
                // Ignore incomplete SSE chunk
              }
            }
          }
        } catch (err) {
          streamController.error(err)
        } finally {
          streamController.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error: unknown) {
    const isTimeout =
      error instanceof Error &&
      (error.name === 'AbortError' || error.message.includes('abort'))

    return new Response(
      JSON.stringify({
        error: isTimeout
          ? 'Nova took too long to respond. Please try again.'
          : 'Network error connecting to Nova AI. Please check your connection and try again.',
        code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
      }),
      {
        status: isTimeout ? 504 : 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}

/**
 * Streams word-by-word simulated responses for local testing or when no key is set.
 */
function createSimulatedStreamResponse(question: string): Response {
  const encoder = new TextEncoder()
  const q = question.toLowerCase()

  let replyText = `**Nova:** That's a great question about NASA spacecraft!

On NovaExplorer, you can explore five key historical missions:
- **Surveyor 3** — Robotic Moon lander inspected by Apollo 12 astronauts.
- **Opportunity** — The 15-year Mars rover that uncovered ancient water evidence.
- **Ingenuity** — The pioneering helicopter that completed 72 powered flights on Mars.
- **InSight** — The Mars seismic station that detected over 1,300 marsquakes.
- **Pioneer 10** — The legendary probe journeying into deep interstellar space.

Ask me about any of these missions or space science concepts!`

  if (q.includes('surveyor')) {
    replyText = `**Surveyor 3** touched down in the **Ocean of Storms** on the Moon in April 1967.

Key highlights:
- Proved lunar dust could support spacecraft landings before Apollo astronauts arrived.
- In November 1969, **Apollo 12 astronauts** Pete Conrad and Alan Bean landed nearby and inspected it on foot.
- They brought back its television camera to Earth to test how space radiation affected its materials.

What would you like to know about Apollo 12's visit?`
  } else if (q.includes('opportunity') || q.includes('water')) {
    replyText = `**Opportunity** (*MER-B*) was designed for a 90-sol mission, but it explored Mars for almost **15 years**!

Key discoveries:
- Found hematite spherules nicknamed **"blueberries"**, which formed in ancient liquid water.
- Traversed craters like **Eagle**, **Endurance**, and **Victoria**, analyzing ancient sedimentary rocks.
- Drove over **45 kilometers (28 miles)**, setting an off-world driving record.

Would you like to explore Opportunity's crater route?`
  } else if (q.includes('ingenuity') || q.includes('fly')) {
    replyText = `**Ingenuity** demonstrated the first powered, controlled flight on another world!

Key achievements:
- Flew in an atmosphere with **less than 1% of Earth's density** using twin blades spinning at ~2,400 RPM.
- Designed as a 5-flight tech demo, it completed **72 flights** across Jezero Crater.
- Served as an aerial scout for the Perseverance rover.

Curious about how its carbon-fiber rotors worked?`
  } else if (q.includes('insight') || q.includes('quake')) {
    replyText = `**InSight** explored deep beneath the Martian surface between 2018 and 2022.

Key findings:
- Deployed a ultra-sensitive seismometer (**SEIS**) protected by a wind shield.
- Recorded over **1,300 marsquakes**, proving Mars is seismically active today.
- Measured the thickness of the Martian crust and mapped its molten core.

Want to learn how a seismometer senses ground vibrations?`
  } else if (q.includes('farthest') || q.includes('pioneer')) {
    replyText = `**Pioneer 10** traveled the farthest of NovaExplorer's five missions!

Key milestones:
- Launched in **1972**, it was the first spacecraft to cross the asteroid belt safely.
- First probe to obtain close-up images of **Jupiter** and its radiation belts.
- Now traveling through **deep interstellar space**, billions of miles from Earth.

Would you like to know what message it carries on its plaque?`
  }

  // Chunk text into words with slight delay simulating token streaming
  const words = replyText.split(/(\s+)/)

  const stream = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word))
        await new Promise((resolve) => setTimeout(resolve, 25))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  })
}
