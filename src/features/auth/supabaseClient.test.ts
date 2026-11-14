import { describe, expect, it, vi } from 'vitest'
import { SupabaseClient, getSupabaseClient } from './supabaseClient.ts'

describe('Supabase Client Scaffolding and Security', () => {
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
