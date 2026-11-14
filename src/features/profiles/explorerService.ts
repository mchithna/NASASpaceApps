/**
 * ExplorerService implementation.
 * Provides session-scoped explorer profile retrieval and updates.
 * Fully conforms to Phase 1.5 ExplorerService contract.
 */

import type {
  AuthService,
  AvatarId,
  ExplorerProfile,
  ExplorerProfileUpdate,
  ExplorerService,
} from '@/contracts/index.ts'
import {
  isAvatarId,
  rankForXp,
  validateNickname,
} from '@/contracts/explorer.ts'
import {
  serviceError,
  serviceOk,
  type ServiceResult,
} from '@/contracts/result.ts'
import {
  getSupabaseClient,
  type SupabaseClient,
} from '@/features/auth/supabaseClient.ts'

export type ExplorerServiceOptions = {
  auth: AuthService
  client?: SupabaseClient
  clock?: () => string
}

export function createExplorerService(options: ExplorerServiceOptions): ExplorerService {
  const { auth, clock = () => new Date().toISOString() } = options
  const client = options.client ?? getSupabaseClient()

  // In-memory bucket for guest sessions or offline mode
  const guestProfiles = new Map<string, ExplorerProfile>()

  function getOrCreateGuestProfile(explorerId: string): ExplorerProfile {
    const existing = guestProfiles.get(explorerId)
    if (existing) {
      return existing
    }
    const at = clock()
    const profile: ExplorerProfile = {
      explorerId,
      kind: 'guest',
      nickname: 'Guest Cadet',
      avatarId: 'cadet-1',
      totalXp: 0,
      rank: rankForXp(0),
      createdAt: at,
      updatedAt: at,
    }
    guestProfiles.set(explorerId, profile)
    return profile
  }

  async function resolveSession() {
    const sessionRes = await auth.getSession()
    if (!sessionRes.ok) {
      return null
    }
    const session = sessionRes.data
    if (session.status !== 'guest' && session.status !== 'authenticated') {
      return null
    }
    return session
  }

  return {
    async getProfile(): Promise<ServiceResult<ExplorerProfile>> {
      const session = await resolveSession()
      if (!session) {
        return serviceError(
          'unauthenticated',
          'Sign in, or continue as a guest, to do that.',
        )
      }

      const { explorerId, kind } = session.identity

      if (kind === 'guest' || !client.isConfigured) {
        const guest = getOrCreateGuestProfile(explorerId)
        return serviceOk(structuredClone(guest))
      }

      // Query database for authenticated registered user
      const { data, error } = await client.query<
        Array<{
          id: string
          kind: 'guest' | 'registered'
          nickname: string
          avatar_id: AvatarId
          total_xp: number
          created_at: string
          updated_at: string
        }>
      >(`profiles?id=eq.${encodeURIComponent(explorerId)}&select=*`)

      if (error) {
        return serviceError(
          'unavailable',
          error.message || 'The explorer profile could not be loaded.',
        )
      }

      if (!data || data.length === 0) {
        const at = clock()
        const defaultProfile: ExplorerProfile = {
          explorerId,
          kind: 'registered',
          nickname: 'Nova Cadet',
          avatarId: 'cadet-1',
          totalXp: 0,
          rank: rankForXp(0),
          createdAt: at,
          updatedAt: at,
        }

        const inserted = await client.query('profiles', {
          method: 'POST',
          body: {
            id: explorerId,
            nickname: defaultProfile.nickname,
            avatar_id: defaultProfile.avatarId,
            kind: 'registered',
            total_xp: 0,
          },
        })

        if (inserted.error) {
          return serviceError(
            'unavailable',
            inserted.error.message || 'The explorer profile could not be created.',
          )
        }

        return serviceOk(defaultProfile)
      }

      const row = data[0]
      if (!row) {
        return serviceError('not-found', 'Profile not found.')
      }

      const profile: ExplorerProfile = {
        explorerId: row.id,
        kind: row.kind,
        nickname: row.nickname,
        avatarId: row.avatar_id,
        totalXp: row.total_xp,
        rank: rankForXp(row.total_xp),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }

      return serviceOk(profile)
    },

    async saveProfile(input: ExplorerProfileUpdate): Promise<ServiceResult<ExplorerProfile>> {
      const session = await resolveSession()
      if (!session) {
        return serviceError(
          'unauthenticated',
          'Sign in, or continue as a guest, to do that.',
        )
      }

      if (input.nickname === undefined && input.avatarId === undefined) {
        return serviceError(
          'invalid-input',
          'Enter a nickname or choose an avatar.',
        )
      }

      let validatedNickname: string | undefined
      if (input.nickname !== undefined) {
        const nickRes = validateNickname(input.nickname)
        if (!nickRes.ok) {
          return nickRes
        }
        validatedNickname = nickRes.data
      }

      if (input.avatarId !== undefined && !isAvatarId(input.avatarId)) {
        return serviceError(
          'invalid-input',
          'Choose an avatar from the list.',
        )
      }

      const { explorerId, kind } = session.identity
      const at = clock()

      if (kind === 'guest' || !client.isConfigured) {
        const guest = getOrCreateGuestProfile(explorerId)
        if (validatedNickname !== undefined) {
          guest.nickname = validatedNickname
        }
        if (input.avatarId !== undefined && isAvatarId(input.avatarId)) {
          guest.avatarId = input.avatarId
        }
        guest.updatedAt = at
        return serviceOk(structuredClone(guest))
      }

      // Persist to Supabase profiles table
      const patchBody: Record<string, unknown> = {
        updated_at: at,
      }
      if (validatedNickname !== undefined) {
        patchBody['nickname'] = validatedNickname
      }
      if (input.avatarId !== undefined) {
        patchBody['avatar_id'] = input.avatarId
      }

      const { error } = await client.query(
        `profiles?id=eq.${encodeURIComponent(explorerId)}`,
        {
          method: 'PATCH',
          body: patchBody,
        },
      )

      if (error) {
        return serviceError('unavailable', error.message || 'Failed to update profile.')
      }

      return this.getProfile()
    },
  }
}
