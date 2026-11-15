import { describe, expect, it, vi } from 'vitest'
import { createAuthService } from '@/features/auth/authService.ts'
import { SupabaseClient } from '@/features/auth/supabaseClient.ts'
import { createExplorerService } from './explorerService.ts'

describe('ExplorerService Implementation Tests', () => {
  it('returns unauthenticated error when no active session exists', async () => {
    const auth = createAuthService()
    const explorer = createExplorerService({ auth })

    const profileRes = await explorer.getProfile()
    expect(profileRes.ok).toBe(false)
    if (!profileRes.ok) {
      expect(profileRes.error.code).toBe('unauthenticated')
    }

    const saveRes = await explorer.saveProfile({ nickname: 'NewNick' })
    expect(saveRes.ok).toBe(false)
    if (!saveRes.ok) {
      expect(saveRes.error.code).toBe('unauthenticated')
    }
  })

  it('provides default guest profile and preserves edits across repeated calls', async () => {
    const auth = createAuthService()
    await auth.startGuestSession()

    const explorer = createExplorerService({ auth })
    const getRes = await explorer.getProfile()
    expect(getRes.ok).toBe(true)
    if (getRes.ok) {
      expect(getRes.data.kind).toBe('guest')
      expect(getRes.data.nickname).toBe('Guest Cadet')
      expect(getRes.data.avatarId).toBe('cadet-1')
      expect(getRes.data.totalXp).toBe(0)
      expect(getRes.data.rank.name).toBe('Space Cadet')
    }

    const saveRes = await explorer.saveProfile({
      nickname: 'Lunar Pathfinder',
      avatarId: 'cadet-3',
    })
    expect(saveRes.ok).toBe(true)
    if (saveRes.ok) {
      expect(saveRes.data.nickname).toBe('Lunar Pathfinder')
      expect(saveRes.data.avatarId).toBe('cadet-3')
    }

    const secondGet = await explorer.getProfile()
    expect(secondGet.ok).toBe(true)
    if (secondGet.ok) {
      expect(secondGet.data.nickname).toBe('Lunar Pathfinder')
      expect(secondGet.data.avatarId).toBe('cadet-3')
    }
  })

  it('rejects invalid inputs on saveProfile', async () => {
    const auth = createAuthService()
    await auth.startGuestSession()
    const explorer = createExplorerService({ auth })

    // Empty input
    const emptyRes = await explorer.saveProfile({})
    expect(emptyRes.ok).toBe(false)
    if (!emptyRes.ok) {
      expect(emptyRes.error.code).toBe('invalid-input')
    }

    // Invalid nickname
    const badNickRes = await explorer.saveProfile({ nickname: '!' })
    expect(badNickRes.ok).toBe(false)
    if (!badNickRes.ok) {
      expect(badNickRes.error.code).toBe('invalid-input')
    }

    // Invalid avatar
    const badAvatarRes = await explorer.saveProfile({ avatarId: 'avatar-99' })
    expect(badAvatarRes.ok).toBe(false)
    if (!badAvatarRes.ok) {
      expect(badAvatarRes.error.code).toBe('invalid-input')
    }
  })

  it('prevents profile access after sign-out', async () => {
    const auth = createAuthService()
    await auth.startGuestSession()
    const explorer = createExplorerService({ auth })

    const activeProfile = await explorer.getProfile()
    expect(activeProfile.ok).toBe(true)

    await auth.signOut()

    const loggedOutProfile = await explorer.getProfile()
    expect(loggedOutProfile.ok).toBe(false)
    if (!loggedOutProfile.ok) {
      expect(loggedOutProfile.error.code).toBe('unauthenticated')
    }
  })

  it('reads and updates registered profile from database client', async () => {
    const mockClient = new SupabaseClient({
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: 'test-key',
    })

    const mockProfileRow = {
      id: 'reg-user-1',
      kind: 'registered' as const,
      nickname: 'Nova Captain',
      avatar_id: 'cadet-2' as const,
      total_xp: 100,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }

    vi.spyOn(mockClient, 'query').mockImplementation(async (endpoint, options) => {
      if (options?.method === 'PATCH') {
        return { data: null, error: null }
      }
      if (endpoint.startsWith('profiles')) {
        return { data: [mockProfileRow], error: null }
      }
      return { data: null, error: null }
    })

    const auth = createAuthService({ client: mockClient })
    vi.spyOn(auth, 'getSession').mockResolvedValue({
      ok: true,
      data: {
        status: 'authenticated',
        identity: { explorerId: 'reg-user-1', kind: 'registered' },
      },
    })

    const explorer = createExplorerService({ auth, client: mockClient })
    const profileRes = await explorer.getProfile()

    expect(profileRes.ok).toBe(true)
    if (profileRes.ok) {
      expect(profileRes.data.nickname).toBe('Nova Captain')
      expect(profileRes.data.totalXp).toBe(100)
      expect(profileRes.data.rank.name).toBe('Lunar Explorer')
    }
  })
})
