/**
 * Production-ready AuthService implementation backed by SupabaseClient.
 * Fully conforms to Phase 1.5 AuthService contract.
 */

import type {
  AuthListener,
  AuthService,
  AuthSession,
  ExplorerIdentity,
  SignInCredentials,
  SignUpCredentials,
} from '@/contracts/index.ts'
import { isAvatarId, validateNickname } from '@/contracts/explorer.ts'
import {
  serviceError,
  serviceOk,
  type ServiceResult,
} from '@/contracts/result.ts'
import {
  getSupabaseClient,
  type AuthUser,
  type SupabaseClient,
} from './supabaseClient.ts'

function normalizeEmail(value: string): string | null {
  const email = value.trim().toLowerCase()
  if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null
  }
  return email
}

function sessionFromUser(user: AuthUser | null): AuthSession {
  if (!user) {
    return { status: 'signed-out' }
  }

  const kind = user.is_anonymous ? 'guest' : 'registered'
  const identity: ExplorerIdentity = {
    explorerId: user.id,
    kind,
  }

  if (kind === 'guest') {
    return { status: 'guest', identity }
  }

  return { status: 'authenticated', identity }
}

export type AuthServiceOptions = {
  client?: SupabaseClient
  initialSession?: AuthSession
}

export function createAuthService(options: AuthServiceOptions = {}): AuthService {
  const client = options.client ?? getSupabaseClient()
  const listeners = new Set<AuthListener>()

  let session: AuthSession =
    options.initialSession ?? sessionFromUser(client.getSession()?.user ?? null)

  // Sync with Supabase client auth events
  client.onAuthStateChange((_event, supabaseSession) => {
    const nextSession = sessionFromUser(supabaseSession?.user ?? null)
    if (JSON.stringify(nextSession) !== JSON.stringify(session)) {
      session = nextSession
      notifyListeners()
    }
  })

  function notifyListeners(): void {
    const current = { ...session }
    for (const listener of [...listeners]) {
      try {
        listener(current)
      } catch (err) {
        console.error('Error in auth subscriber:', err)
      }
    }
  }

  return {
    async getSession(): Promise<ServiceResult<AuthSession>> {
      if (client.isConfigured && client.getSession()) {
        const fresh = await client.ensureFreshSession()
        session = sessionFromUser(fresh?.user ?? null)
      }
      return serviceOk({ ...session })
    },

    async startGuestSession(): Promise<ServiceResult<AuthSession>> {
      if (!client.isConfigured) {
        const guestId = `guest-${crypto.randomUUID()}`
        session = {
          status: 'guest',
          identity: {
            explorerId: guestId,
            kind: 'guest',
          },
        }
        notifyListeners()
        return serviceOk({ ...session })
      }

      const { data, error } = await client.signInAnonymously()
      if (error || !data?.user) {
        return serviceError(
          'unavailable',
          error?.message || 'Guest sign-in is unavailable right now.',
        )
      }

      session = {
        status: 'guest',
        identity: {
          explorerId: data.user.id,
          kind: 'guest',
        },
      }
      notifyListeners()
      return serviceOk({ ...session })
    },

    async signIn(credentials: SignInCredentials): Promise<ServiceResult<AuthSession>> {
      const email = normalizeEmail(credentials.email)
      if (!email || credentials.password.length === 0) {
        return serviceError('invalid-input', 'Enter your email and password.')
      }

      const { data, error } = await client.signInWithPassword({
        email,
        password: credentials.password,
      })

      if (error || !data?.user || !data.session) {
        const message = error?.message ?? ''
        if (
          !client.isConfigured ||
          /network|not configured|unavailable/i.test(message)
        ) {
          return serviceError('unavailable', 'Sign-in is unavailable right now.')
        }
        return serviceError(
          'invalid-input',
          'Those sign-in details do not match.',
        )
      }

      session = {
        status: 'authenticated',
        identity: {
          explorerId: data.user.id,
          kind: 'registered',
        },
      }
      notifyListeners()
      return serviceOk({ ...session })
    },

    async signUp(credentials: SignUpCredentials): Promise<ServiceResult<AuthSession>> {
      const email = normalizeEmail(credentials.email)
      if (!email) {
        return serviceError('invalid-input', 'Enter a valid email address.')
      }

      if (credentials.password.length < 8 || credentials.password.length > 72) {
        return serviceError(
          'invalid-input',
          'Use a password of at least 8 characters.',
        )
      }

      const nickname = validateNickname(credentials.nickname)
      if (!nickname.ok) {
        return nickname
      }

      if (!isAvatarId(credentials.avatarId)) {
        return serviceError('invalid-input', 'Choose an avatar from the list.')
      }

      const { data, error } = await client.signUp({
        email,
        password: credentials.password,
        data: {
          nickname: nickname.data,
          avatar_id: credentials.avatarId,
        },
      })

      if (error || !data?.user) {
        const msg = error?.message?.toLowerCase() ?? ''
        if (msg.includes('already registered') || msg.includes('conflict')) {
          return serviceError('conflict', 'An explorer already uses that email.')
        }
        if (/network|not configured|unavailable/i.test(msg)) {
          return serviceError('unavailable', 'Registration is unavailable right now.')
        }
        return serviceError('invalid-input', error?.message || 'Unable to register account.')
      }

      if (!data.session) {
        return serviceError(
          'unavailable',
          'Confirm the email address before signing in. Email confirmation is still required for this project.',
        )
      }

      // Initialize profile row in database if client is configured
      if (client.isConfigured) {
        await client.query('profiles', {
          method: 'POST',
          body: {
            id: data.user.id,
            nickname: nickname.data,
            avatar_id: credentials.avatarId,
            kind: 'registered',
            total_xp: 0,
          },
        })
      }

      session = {
        status: 'authenticated',
        identity: {
          explorerId: data.user.id,
          kind: 'registered',
        },
      }
      notifyListeners()
      return serviceOk({ ...session })
    },

    async signOut(): Promise<ServiceResult<AuthSession>> {
      await client.signOut()
      session = { status: 'signed-out' }
      notifyListeners()
      return serviceOk({ ...session })
    },

    subscribe(listener: AuthListener): () => void {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
