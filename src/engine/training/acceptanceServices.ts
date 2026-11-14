/** Explicit development-only fixture. No Supabase imports, credentials, or real-user writes. */
import { createMockServices } from '@/mocks/createMockServices.ts'
import type { MockExplorerSeed } from '@/mocks/fixtures.ts'
import { serviceError } from '@/contracts/result.ts'

const modeKey = 'novaexplorer.acceptance.enabled'
const snapshotKey = 'novaexplorer.acceptance.training.v1'
type Snapshot = { version: 1; seed: MockExplorerSeed; active: boolean }

export function acceptanceEnabled(): boolean {
  if (!import.meta.env.DEV) return false
  if (
    new URLSearchParams(window.location.search).get('acceptance') === 'training'
  ) {
    sessionStorage.setItem(modeKey, 'true')
  }
  return sessionStorage.getItem(modeKey) === 'true'
}

export function createAcceptanceServices() {
  if (!import.meta.env.DEV)
    throw new Error('Acceptance fixtures are development-only.')
  let saved: Snapshot | null = null
  try {
    const value: unknown = JSON.parse(
      sessionStorage.getItem(snapshotKey) ?? 'null',
    )
    if (
      value &&
      typeof value === 'object' &&
      'version' in value &&
      value.version === 1 &&
      'seed' in value &&
      'active' in value
    ) {
      saved = value as Snapshot
    }
  } catch {
    /* A malformed test snapshot starts a fresh isolated fixture. */
  }
  const services = createMockServices({
    persona: saved?.active ? 'guest' : 'signed-out',
    guestSeed: saved?.seed,
    onGuestChange(seed, active) {
      sessionStorage.setItem(
        snapshotKey,
        JSON.stringify({ version: 1, seed, active } satisfies Snapshot),
      )
    },
  })
  // Never save test passwords or impersonate a real registered account.
  services.auth.signIn = async () =>
    serviceError(
      'unavailable',
      'This isolated acceptance environment uses guest fixtures only.',
    )
  services.auth.signUp = services.auth.signIn
  return services
}

export function newAcceptanceGuest(): void {
  sessionStorage.removeItem(snapshotKey) // Only this explicitly isolated test fixture.
  window.location.assign('/')
}
