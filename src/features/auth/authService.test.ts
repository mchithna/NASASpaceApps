import { describe, expect, it, vi } from 'vitest'
import { createAuthService } from './authService.ts'
import { SupabaseClient } from './supabaseClient.ts'

describe('AuthService Implementation Tests', () => {
  it('initializes with signed-out session by default', async () => {
    const auth = createAuthService()
    const sessionRes = await auth.getSession()
    expect(sessionRes.ok).toBe(true)
    if (sessionRes.ok) {
      expect(sessionRes.data.status).toBe('signed-out')
    }
  })

  it('starts guest session successfully and provides explorer identity', async () => {
    const auth = createAuthService()
    const startRes = await auth.startGuestSession()
    expect(startRes.ok).toBe(true)
    if (startRes.ok) {
      expect(startRes.data.status).toBe('guest')
      if (startRes.data.status === 'guest') {
        expect(startRes.data.identity.kind).toBe('guest')
        expect(startRes.data.identity.explorerId).toBeTruthy()
      }
    }
  })

  it('rejects signIn with empty or invalid credentials using normalized error', async () => {
    const auth = createAuthService()
    const emptyRes = await auth.signIn({ email: '', password: '' })
    expect(emptyRes.ok).toBe(false)
    if (!emptyRes.ok) {
      expect(emptyRes.error.code).toBe('invalid-input')
      expect(emptyRes.error.message).toBe('Enter your email and password.')
    }

    const invalidRes = await auth.signIn({ email: 'notanemail', password: 'password123' })
    expect(invalidRes.ok).toBe(false)
    if (!invalidRes.ok) {
      expect(invalidRes.error.code).toBe('invalid-input')
    }
  })

  it('rejects signUp with invalid nickname or password length', async () => {
    const auth = createAuthService()

    // Short password
    const shortPassRes = await auth.signUp({
      email: 'cadet@example.com',
      password: 'short',
      nickname: 'Cadet',
      avatarId: 'cadet-1',
    })
    expect(shortPassRes.ok).toBe(false)
    if (!shortPassRes.ok) {
      expect(shortPassRes.error.code).toBe('invalid-input')
    }

    // Invalid nickname
    const badNickRes = await auth.signUp({
      email: 'cadet@example.com',
      password: 'password123',
      nickname: 'x',
      avatarId: 'cadet-1',
    })
    expect(badNickRes.ok).toBe(false)
    if (!badNickRes.ok) {
      expect(badNickRes.error.code).toBe('invalid-input')
    }

    // Invalid avatar
    const badAvatarRes = await auth.signUp({
      email: 'cadet@example.com',
      password: 'password123',
      nickname: 'Nova Pilot',
      avatarId: 'invalid-avatar',
    })
    expect(badAvatarRes.ok).toBe(false)
    if (!badAvatarRes.ok) {
      expect(badAvatarRes.error.code).toBe('invalid-input')
    }
  })

  it('signs in and signs out with mock client successfully', async () => {
    const mockClient = new SupabaseClient({
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: 'test-key',
    })

    vi.spyOn(mockClient, 'signInWithPassword').mockResolvedValue({
      data: {
        user: { id: 'usr-123', email: 'nova@example.com' },
        session: {
          access_token: 'tok-123',
          token_type: 'bearer',
          refresh_token: 'ref-123',
          user: { id: 'usr-123', email: 'nova@example.com' },
        },
      },
      error: null,
    })

    vi.spyOn(mockClient, 'signOut').mockResolvedValue({ error: null })

    const auth = createAuthService({ client: mockClient })

    const signInRes = await auth.signIn({
      email: 'nova@example.com',
      password: 'valid-password',
    })
    expect(signInRes.ok).toBe(true)
    if (signInRes.ok && signInRes.data.status === 'authenticated') {
      expect(signInRes.data.identity.explorerId).toBe('usr-123')
      expect(signInRes.data.identity.kind).toBe('registered')
    }

    const signOutRes = await auth.signOut()
    expect(signOutRes.ok).toBe(true)
    if (signOutRes.ok) {
      expect(signOutRes.data.status).toBe('signed-out')
    }
  })

  it('manages subscribers and unsubscribes properly', async () => {
    const auth = createAuthService()
    const listener = vi.fn()
    const unsubscribe = auth.subscribe(listener)

    await auth.startGuestSession()
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    await auth.signOut()
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
