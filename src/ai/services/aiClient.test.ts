import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  checkAiHealth,
  sendChatMessage,
  synthesizeSpeech,
} from './aiClient.ts'

describe('AI Client (Browser)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('checks health status and reports live status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'ok',
          provider: 'Google Gemini',
          isConfigured: true,
        }),
      }),
    )

    const health = await checkAiHealth()
    expect(health.isConfigured).toBe(true)
    expect(health.provider).toBe('Google Gemini')
  })

  it('sends chat message and receives structured response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: 'The Ingenuity helicopter flew 72 times on Mars.',
          sources: [
            {
              title: 'NASA Ingenuity Overview',
              url: 'https://science.nasa.gov/mission/ingenuity/',
            },
          ],
          suggestedQuestions: ['How fast did the blades spin?'],
          isLive: true,
          model: 'gemini-3.5-flash',
        }),
      }),
    )

    const response = await sendChatMessage({
      messages: [{ role: 'user', content: 'Tell me about Ingenuity' }],
      missionId: 'ingenuity',
    })

    expect(response.content).toContain('flew 72 times')
    expect(response.isLive).toBe(true)
    expect(response.sources.length).toBe(1)
  })

  it('falls back gracefully to offline source guide when server is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValueOnce(new Error('Network offline')),
    )

    const response = await sendChatMessage({
      messages: [{ role: 'user', content: 'What is a seismometer?' }],
    })

    expect(response.content).toBeDefined()
    expect(response.isLive).toBe(false)
    expect(response.model).toBe('Source Guide Fallback')
  })

  it('calls TTS synthesis endpoint and returns audio payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          audioBase64: 'UklGRhR3AQBXQVZF...',
          mimeType: 'audio/wav',
        }),
      }),
    )

    const tts = await synthesizeSpeech('Hello Explorer')
    expect(tts.audioBase64).toBe('UklGRhR3AQBXQVZF...')
    expect(tts.mimeType).toBe('audio/wav')
  })
})
