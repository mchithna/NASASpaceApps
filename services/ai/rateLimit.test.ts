import { describe, expect, it } from 'vitest'
import { checkRateLimit } from './rateLimit.ts'

describe('Rate Limiter', () => {
  it('allows requests within limit', () => {
    const id = 'test-client-1'
    const r1 = checkRateLimit(id, 5, 1000)
    expect(r1.allowed).toBe(true)
    expect(r1.remaining).toBe(4)

    const r2 = checkRateLimit(id, 5, 1000)
    expect(r2.allowed).toBe(true)
    expect(r2.remaining).toBe(3)
  })

  it('rejects requests exceeding limit', () => {
    const id = 'test-client-2'
    for (let i = 0; i < 3; i++) {
      checkRateLimit(id, 3, 1000)
    }
    const exceeded = checkRateLimit(id, 3, 1000)
    expect(exceeded.allowed).toBe(false)
    expect(exceeded.remaining).toBe(0)
    expect(exceeded.resetMs).toBeGreaterThan(0)
  })
})
