import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  SupabaseClient,
  buildApiHeaders,
  getSupabaseClient,
  resolveSupabaseApiKey,
} from './supabaseClient.ts'

describe('Supabase Client Scaffolding and Security', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('prefers the publishable key and keeps the legacy anon key as a fallback', () => {
    expect(resolveSupabaseApiKey(' sb_publishable_example ', 'eyJ.legacy')).toBe(
      'sb_publishable_example',
    )
    expect(resolveSupabaseApiKey('   ', 'eyJ.legacy')).toBe('eyJ.legacy')
    expect(resolveSupabaseApiKey(undefined, undefined)).toBe('')
  })

  it('does not send a publishable key as a bearer token', () => {
    const modern = buildApiHeaders('sb_publishable_example')
    expect(modern.apikey).toBe('sb_publishable_example')
    expect(modern.Authorization).toBeUndefined()

    const legacy = buildApiHeaders('eyJ.legacy')
    expect(legacy.Authorization).toBe('Bearer eyJ.legacy')

    const signedIn = buildApiHeaders('sb_publishable_example', 'explorer-access-token')
    expect(signedIn.Authorization).toBe('Bearer explorer-access-token')
  })

  it('restores a stored session for the same project and clears it on sign-out', () => {
    const config = {
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'sb_publishable_example',
    }
    const first = new SupabaseClient(config)
    const stored = {
      access_token: 'test-token',
      token_type: 'bearer',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'test-refresh',
      user: { id: 'test-user-id', email: 'cadet@example.com' },
    }
    first.setSession(stored, 'SIGNED_IN')

    const second = new SupabaseClient(config)
    expect(second.getSession()?.user.id).toBe('test-user-id')

    second.setSession(null, 'SIGNED_OUT')
    const third = new SupabaseClient(config)
    expect(third.getSession()).toBeNull()
  })

  it('instantiates unconfigured client cleanly when env vars are missing', () => {
    const client = new SupabaseClient({ supabaseUrl: '', supabaseAnonKey: '' })
    expect(client.isConfigured).toBe(false)
  })

  it('manages sessions and notifies listeners on change', () => {
    const client = new SupabaseClient({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'test-anon-key',
    })
    expect(client.isConfigured).toBe(true)

    const listener = vi.fn()
    const { unsubscribe } = client.onAuthStateChange(listener)

    const mockSession = {
      access_token: 'test-token',
      token_type: 'bearer',
      refresh_token: 'test-refresh',
      user: { id: 'test-user-id', email: 'cadet@example.com' },
    }

    client.setSession(mockSession, 'SIGNED_IN')
    expect(listener).toHaveBeenCalledWith('SIGNED_IN', mockSession)
    expect(client.getSession()).toEqual(mockSession)

    unsubscribe()
    client.setSession(null, 'SIGNED_OUT')
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('returns singleton client via getSupabaseClient', () => {
    const c1 = getSupabaseClient()
    const c2 = getSupabaseClient()
    expect(c1).toBe(c2)
  })

  it('safely handles unconfigured query or rpc invocation without throwing', async () => {
    const client = new SupabaseClient({ supabaseUrl: '', supabaseAnonKey: '' })
    const rpcResult = await client.rpc('test_rpc')
    expect(rpcResult.error).toBeDefined()
    expect(rpcResult.error?.message).toContain('unavailable')

    const queryResult = await client.query('profiles')
    expect(queryResult.error).toBeDefined()
    expect(queryResult.error?.message).toContain('unavailable')
  })
})
