import { describe, expect, it } from 'vitest'
import {
  serviceError,
  serviceErrorCodes,
  serviceOk,
  type AuthService,
  type ExplorerService,
  type NovaServices,
  type ProgressService,
  type RewardsService,
} from '@/contracts/index.ts'

describe('Feature Scaffolding Smoke Tests', () => {
  it('conforms to standard ServiceResult error and ok structure', () => {
    const okResult = serviceOk({ test: 'data' })
    expect(okResult.ok).toBe(true)
    if (okResult.ok) {
      expect(okResult.data.test).toBe('data')
    }

    const errResult = serviceError('unauthenticated', 'Session required.')
    expect(errResult.ok).toBe(false)
    if (!errResult.ok) {
      expect(errResult.error.code).toBe('unauthenticated')
      expect(errResult.error.message).toBe('Session required.')
      expect(serviceErrorCodes).toContain(errResult.error.code)
    }
  })

  it('validates interface types for all four player services', () => {
    const dummyServices: Partial<NovaServices> = {
      auth: undefined as unknown as AuthService,
      explorer: undefined as unknown as ExplorerService,
      progress: undefined as unknown as ProgressService,
      rewards: undefined as unknown as RewardsService,
    }
    expect(dummyServices).toBeDefined()
  })
})
