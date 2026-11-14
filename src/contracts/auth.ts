/**
 * Authentication state.
 * Passwords and tokens are request inputs only. They are not part of these types
 * and must not be copied onto an explorer profile.
 */

export const authStatuses = [
  'initializing',
  'guest',
  'authenticated',
  'signed-out',
] as const

export type AuthStatus = (typeof authStatuses)[number]

export type ExplorerKind = 'guest' | 'registered'

/** Identity for the current session. Services read this from the session. */
export type ExplorerIdentity = {
  explorerId: string
  kind: ExplorerKind
}

export type AuthSession =
  | { status: 'initializing' }
  | { status: 'signed-out' }
  | { status: 'guest'; identity: ExplorerIdentity }
  | { status: 'authenticated'; identity: ExplorerIdentity }

/** Sent once to the auth provider. Do not store or return this object. */
export type SignInCredentials = {
  email: string
  password: string
}

/** Sent once to the auth provider. Do not store or return this object. */
export type SignUpCredentials = {
  email: string
  password: string
  nickname: string
  avatarId: string
}

export type AuthListener = (session: AuthSession) => void
