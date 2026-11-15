import { describe, expect, it, vi, beforeEach } from 'vitest'
import { GeminiProvider } from './geminiProvider.ts'
import {
  buildSystemPrompt,
  getGroundingSources,
  generateSuggestedQuestions,
} from './grounding.ts'

describe('Gemini Provider & Grounding Layer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('reports availability when API keys are configured', () => {
    const providerWithKeys = new GeminiProvider(['fake-key-1', 'fake-key-2'])
    expect(providerWithKeys.isAvailable()).toBe(true)

    const providerWithoutKeys = new GeminiProvider([])
    expect(providerWithoutKeys.isAvailable()).toBe(false)
  })

  it('rotates to next key when rate limit 429 is encountered', async () => {
    const keys = ['key-1', 'key-2']
    const provider = new GeminiProvider(keys)

    const fetchMock = vi.fn()
    // First call with key-1 fails with 429
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: 'Quota exceeded' } }),
    })
    // Second call with key-2 succeeds
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: { parts: [{ text: 'Grounded NASA answer' }] },
          },
        ],
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const response = await provider.generateChat({
      messages: [{ role: 'user', content: 'What is Surveyor 3?' }],
      missionId: 'surveyor-3',
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0][0]).toContain('key-1')
    expect(fetchMock.mock.calls[1][0]).toContain('key-2')
    expect(response.content).toBe('Grounded NASA answer')
    expect(response.isLive).toBe(true)
  })

  it('grounds system prompt with mission facts and citations', () => {
    const prompt = buildSystemPrompt({
      missionId: 'opportunity',
      simple: true,
      persona: 'commander',
      contextData: { rank: 'Commander', xp: 450 },
    })

    expect(prompt).toContain('Opportunity')
    expect(prompt).toContain('blueberries')
    expect(prompt).toContain('EXPLAIN SIMPLY')
    expect(prompt).toContain('NOVA MISSION COMMANDER')
    expect(prompt).toContain('Commander')
  })

  it('retrieves verified NASA grounding sources for missions', () => {
    const sources = getGroundingSources('ingenuity')
    expect(sources.length).toBeGreaterThan(0)
    expect(sources[0].url).toContain('nasa.gov')
    expect(sources[0].title).toContain('Ingenuity')
  })

  it('generates suggested exploration questions', () => {
    const questions = generateSuggestedQuestions('pioneer-10')
    expect(questions.length).toBe(4)
    expect(questions[0]).toContain('Pioneer 10')
  })
})
