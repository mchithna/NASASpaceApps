import { afterEach, describe, expect, it, vi } from 'vitest'
import { SupabaseClient, type SupabaseSession } from './supabaseClient.ts'
import { createAuthService } from './authService.ts'
import { createExplorerService } from '@/features/profiles/explorerService.ts'
import { assertPublicSupabaseKey } from './publicKey.ts'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  localStorage.clear()
})
function client() {
  return new SupabaseClient({
    supabaseUrl: 'https://security-test.invalid',
    supabaseAnonKey: 'test-public-key',
  })
}
function expired(): SupabaseSession {
  return {
    access_token: 'test-expired',
    refresh_token: 'test-refresh',
    token_type: 'bearer',
    expires_at: 1,
    user: { id: 'security-test-user' },
  }
}
function refreshed(): Response {
  return new Response(
    JSON.stringify({
      ...expired(),
      access_token: 'test-renewed',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }),
    { status: 200 },
  )
}

describe('auth and profile security recovery', () => {
  it('rejects privileged keys without exposing their contents', () => {
    const privileged = `eyJ.${btoa(JSON.stringify({ role: 'service_role' }))}.test-signature`
    expect(() => assertPublicSupabaseKey(privileged)).toThrow(
      'Privileged Supabase keys',
    )
    expect(() => assertPublicSupabaseKey('  sb_secret_test-only  ')).toThrow(
      'Privileged Supabase keys',
    )
    expect(() =>
      assertPublicSupabaseKey('sb_publishable_test-only'),
    ).not.toThrow()
    expect(() => new SupabaseClient({ supabaseAnonKey: privileged })).toThrow(
      'Privileged Supabase keys',
    )
  })
  it('coalesces simultaneous refreshes and prevents late refresh from restoring a signed-out identity', async () => {
    const db = client()
    db.setSession(expired())
    let release!: (value: Response) => void
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          release = resolve
        }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const first = db.ensureFreshSession()
    const second = db.ensureFreshSession()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    release(refreshed())
    expect((await first)?.access_token).toBe('test-renewed')
    expect((await second)?.access_token).toBe('test-renewed')
    db.setSession(expired())
    const late = db.ensureFreshSession()
    db.setSession(null, 'SIGNED_OUT')
    release(refreshed())
    expect(await late).toBeNull()
    expect(db.getSession()).toBeNull()
  })
  it('retains recovery credentials on network loss and returns retryable failure', async () => {
    const db = client()
    db.setSession(expired())
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockRejectedValueOnce(new Error('offline'))
        .mockResolvedValueOnce(refreshed()),
    )
    const auth = createAuthService({ client: db })
    const failed = await auth.getSession()
    expect(!failed.ok && failed.error.code).toBe('unavailable')
    expect(db.getSession()?.refresh_token).toBe('test-refresh')
    const retried = await auth.getSession()
    expect(retried.ok && retried.data.status).toBe('authenticated')
  })
  it('does not report an RLS-filtered or missing profile update as saved', async () => {
    const db = client()
    const auth = createAuthService({
      client: db,
      initialSession: {
        status: 'authenticated',
        identity: { explorerId: 'security-test-user', kind: 'registered' },
      },
    })
    const query = vi
      .spyOn(db, 'query')
      .mockResolvedValue({ data: [], error: null })
    const result = await createExplorerService({
      auth,
      client: db,
    }).saveProfile({ nickname: 'New Cadet' })
    expect(!result.ok && result.error.code).toBe('conflict')
    expect(query).toHaveBeenCalledTimes(1)
  })
  it('reports incomplete signup profile persistence rather than success', async () => {
    const db = client()
    vi.spyOn(db, 'signUp').mockResolvedValue({
      data: { user: expired().user, session: expired() },
      error: null,
    })
    vi.spyOn(db, 'query').mockResolvedValue({
      data: null,
      error: { message: 'connection interrupted' },
    })
    const result = await createAuthService({ client: db }).signUp({
      email: 'test@example.com',
      password: 'test-only-password',
      nickname: 'Test Cadet',
      avatarId: 'cadet-1',
    })
    expect(!result.ok && result.error.code).toBe('unavailable')
    expect(!result.ok && result.error.message).toContain(
      'profile could not be saved',
    )
  })
  it('does not invent an offline production guest', async () => {
    vi.stubEnv('PROD', true)
    const db = new SupabaseClient({ supabaseUrl: '', supabaseAnonKey: '' })
    expect(
      (await createAuthService({ client: db }).startGuestSession()).ok,
    ).toBe(false)
  })
})
