/**
 * In-memory services for Builders B and C.
 * Each call creates an isolated instance. Nothing here is wired into the app.
 * Do not import this module from `AppProviders` or the production router.
 */

import type {
  AchievementId,
  AuthListener,
  AuthSession,
  DiscoveryUnlockResult,
  ExplorerProfile,
  ExplorerProfileUpdate,
  JournalEntry,
  MilestoneGrant,
  MissionId,
  MissionMilestoneId,
  MissionProgress,
  NovaServices,
  XpRewardEvent,
} from '@/contracts/index.ts'
import { isStableKey } from '@/contracts/ids.ts'
import {
  isAvatarId,
  rankForXp,
  validateNickname,
} from '@/contracts/explorer.ts'
import {
  achievementCatalog,
  discoveryCatalog,
  isAchievementId,
  isMissionMilestoneId,
  journalPlaceholderSummary,
  milestoneXp,
  rewardKeyFor,
  storyAchievementId,
  sumXp,
} from '@/contracts/rewards.ts'
import {
  serviceError,
  serviceOk,
  type ServiceResult,
} from '@/contracts/result.ts'
import { isMissionId } from '@/missions/registry.ts'
import { missionIds } from '@/missions/types.ts'
import {
  createGuestSeed,
  createRegisteredSeed,
  mockRegisteredCredentials,
  mockTime,
  type MockExplorerSeed,
} from '@/mocks/fixtures.ts'

export type MockPersona = 'initializing' | 'signed-out' | 'guest' | 'registered'

export type MockServicesOptions = {
  persona?: MockPersona
  /** ISO timestamp factory. Defaults to a fixed clock. */
  clock?: () => string
  /** Explicit dev/test fixture hydration. Never use for production accounts. */
  guestSeed?: MockExplorerSeed
  onGuestChange?: (seed: MockExplorerSeed, active: boolean) => void
}

type Bucket = {
  profile: ExplorerProfile
  progress: Map<MissionId, MissionProgress>
  rewards: XpRewardEvent[]
  achievements: Map<AchievementId, string>
  journal: JournalEntry[]
}

type Account = {
  email: string
  password: string
  bucket: Bucket
}

type Gate =
  | { ok: true; bucket: Bucket }
  | { ok: false; error: { code: 'unauthenticated'; message: string } }

function copy<T>(value: T): T {
  return structuredClone(value)
}

function bucketFromSeed(seed: MockExplorerSeed): Bucket {
  return {
    profile: copy(seed.profile),
    progress: new Map(
      seed.progress.map((progress) => [progress.missionId, copy(progress)]),
    ),
    rewards: copy([...seed.rewards]),
    achievements: new Map(
      seed.unlockedAchievements.map((unlock) => [
        unlock.achievementId,
        unlock.unlockedAt,
      ]),
    ),
    journal: copy([...seed.journal]),
  }
}

function cloneSession(session: AuthSession): AuthSession {
  if (session.status === 'guest' || session.status === 'authenticated') {
    return {
      status: session.status,
      identity: { ...session.identity },
    }
  }

  return { status: session.status }
}

function normalizeEmail(value: string): string | null {
  const email = value.trim().toLowerCase()
  if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null
  }
  return email
}

function explorerIdFromEmail(email: string): string | null {
  const local = email.split('@')[0] ?? ''
  const slug = local
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const explorerId = `explorer-${slug}`

  if (!isStableKey(slug) || !isStableKey(explorerId)) {
    return null
  }

  return explorerId
}

function emptyRegisteredBucket(
  explorerId: string,
  nickname: string,
  avatarId: ExplorerProfile['avatarId'],
  at: string,
): Bucket {
  const guest = bucketFromSeed(createGuestSeed())
  guest.profile = {
    ...guest.profile,
    explorerId,
    kind: 'registered',
    nickname,
    avatarId,
    totalXp: 0,
    rank: rankForXp(0),
    createdAt: at,
    updatedAt: at,
  }
  return guest
}

export function createMockServices(
  options: MockServicesOptions = {},
): NovaServices {
  const clock = options.clock ?? (() => mockTime)
  const persona = options.persona ?? 'signed-out'
  const guest = bucketFromSeed(options.guestSeed ?? createGuestSeed())
  const accounts: Account[] = [
    {
      email: mockRegisteredCredentials.email,
      password: mockRegisteredCredentials.password,
      bucket: bucketFromSeed(createRegisteredSeed()),
    },
  ]
  const listeners = new Set<AuthListener>()

  let session: AuthSession = initialSession(persona, guest, accounts[0])
  function publishGuest(): void {
    options.onGuestChange?.(
      {
        profile: copy(guest.profile),
        progress: copy([...guest.progress.values()]),
        rewards: copy(guest.rewards),
        journal: copy(guest.journal),
        unlockedAchievements: [...guest.achievements].map(
          ([achievementId, unlockedAt]) => ({ achievementId, unlockedAt }),
        ),
      },
      session.status === 'guest',
    )
  }

  function publish(): void {
    const snapshot = cloneSession(session)
    for (const listener of [...listeners]) {
      listener(snapshot)
    }
  }

  function setSession(next: AuthSession): AuthSession {
    session = next
    publishGuest()
    publish()
    return cloneSession(session)
  }

  function activeBucket(): Bucket | null {
    if (session.status === 'guest') {
      return guest
    }

    if (session.status === 'authenticated') {
      const explorerId = session.identity.explorerId
      return (
        accounts.find(
          (account) => account.bucket.profile.explorerId === explorerId,
        )?.bucket ?? null
      )
    }

    return null
  }

  function requireBucket(): Gate {
    const bucket = activeBucket()
    if (!bucket) {
      return {
        ok: false,
        error: {
          code: 'unauthenticated',
          message: 'Sign in, or continue as a guest, to do that.',
        },
      }
    }

    return { ok: true, bucket }
  }

  function requireMission(missionId: string): ServiceResult<MissionId> {
    if (!isMissionId(missionId)) {
      return serviceError(
        'invalid-input',
        'Choose one of the five NovaExplorer missions.',
      )
    }

    return serviceOk(missionId)
  }

  function requireCheckpoint(checkpointId: string): ServiceResult<string> {
    if (!isStableKey(checkpointId)) {
      return serviceError(
        'invalid-input',
        'Checkpoint names use lowercase letters, numbers, and hyphens.',
      )
    }

    return serviceOk(checkpointId)
  }

  function progressFor(
    bucket: Bucket,
    missionId: MissionId,
  ): MissionProgress | null {
    return bucket.progress.get(missionId) ?? null
  }

  function applyXp(
    bucket: Bucket,
    at: string,
  ): { totalXp: number; rank: ExplorerProfile['rank'] } {
    const totalXp = sumXp(bucket.rewards)
    const rank = rankForXp(totalXp)
    bucket.profile = {
      ...bucket.profile,
      totalXp,
      rank,
      updatedAt: at,
    }
    return { totalXp, rank }
  }

  function grant(
    bucket: Bucket,
    missionId: MissionId,
    milestoneId: MissionMilestoneId,
    at: string,
  ): MilestoneGrant {
    const rewardKey = rewardKeyFor(missionId, milestoneId)
    const existing = bucket.rewards.find(
      (event) => event.rewardKey === rewardKey,
    )

    if (existing) {
      return {
        awarded: false,
        rewardKey,
        xpAwarded: 0,
        event: copy(existing),
        totalXp: bucket.profile.totalXp,
        rank: copy(bucket.profile.rank),
      }
    }

    const event: XpRewardEvent = {
      rewardKey,
      missionId,
      milestoneId,
      xp: milestoneXp[milestoneId],
      awardedAt: at,
    }
    bucket.rewards.push(event)
    const { totalXp, rank } = applyXp(bucket, at)
    if (bucket === guest) publishGuest()

    return {
      awarded: true,
      rewardKey,
      xpAwarded: event.xp,
      event: copy(event),
      totalXp,
      rank: copy(rank),
    }
  }

  function unlockAchievement(
    bucket: Bucket,
    achievementId: AchievementId,
    at: string,
  ) {
    const existing = bucket.achievements.get(achievementId)
    if (existing) {
      return {
        awarded: false as const,
        unlock: { achievementId, unlockedAt: existing },
      }
    }

    bucket.achievements.set(achievementId, at)
    if (bucket === guest) publishGuest()
    return {
      awarded: true as const,
      unlock: { achievementId, unlockedAt: at },
    }
  }

  const auth: NovaServices['auth'] = {
    async getSession() {
      return serviceOk(cloneSession(session))
    },

    async startGuestSession() {
      return serviceOk(
        setSession({
          status: 'guest',
          identity: {
            explorerId: guest.profile.explorerId,
            kind: 'guest',
          },
        }),
      )
    },

    async signIn(credentials) {
      const email = normalizeEmail(credentials.email)
      if (!email || credentials.password.length === 0) {
        return serviceError('invalid-input', 'Enter your email and password.')
      }

      const account = accounts.find((item) => item.email === email)
      if (!account || account.password !== credentials.password) {
        return serviceError(
          'invalid-input',
          'Those sign-in details do not match.',
        )
      }

      return serviceOk(
        setSession({
          status: 'authenticated',
          identity: {
            explorerId: account.bucket.profile.explorerId,
            kind: 'registered',
          },
        }),
      )
    },

    async signUp(credentials) {
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

      if (accounts.some((account) => account.email === email)) {
        return serviceError('conflict', 'An explorer already uses that email.')
      }

      const explorerId = explorerIdFromEmail(email)
      if (!explorerId) {
        return serviceError(
          'invalid-input',
          'Use an email with letters or numbers before the @ sign.',
        )
      }

      if (
        accounts.some(
          (account) => account.bucket.profile.explorerId === explorerId,
        )
      ) {
        return serviceError(
          'conflict',
          'An explorer already uses that email name.',
        )
      }

      const at = clock()
      const account: Account = {
        email,
        password: credentials.password,
        bucket: emptyRegisteredBucket(
          explorerId,
          nickname.data,
          credentials.avatarId,
          at,
        ),
      }
      accounts.push(account)

      return serviceOk(
        setSession({
          status: 'authenticated',
          identity: { explorerId, kind: 'registered' },
        }),
      )
    },

    async signOut() {
      return serviceOk(setSession({ status: 'signed-out' }))
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }

  const explorer: NovaServices['explorer'] = {
    async getProfile() {
      const gate = requireBucket()
      if (!gate.ok) {
        return serviceError(gate.error.code, gate.error.message)
      }

      return serviceOk(copy(gate.bucket.profile))
    },

    async saveProfile(input: ExplorerProfileUpdate) {
      const gate = requireBucket()
      if (!gate.ok) {
        return serviceError(gate.error.code, gate.error.message)
      }

      if (input.nickname === undefined && input.avatarId === undefined) {
        return serviceError(
          'invalid-input',
          'Enter a nickname or choose an avatar.',
        )
      }

      let nickname = gate.bucket.profile.nickname
      if (input.nickname !== undefined) {
        const validated = validateNickname(input.nickname)
        if (!validated.ok) {
          return validated
        }
        nickname = validated.data
      }

      let avatarId = gate.bucket.profile.avatarId
      if (input.avatarId !== undefined) {
        if (!isAvatarId(input.avatarId)) {
          return serviceError(
            'invalid-input',
            'Choose an avatar from the list.',
          )
        }
        avatarId = input.avatarId
      }

      gate.bucket.profile = {
        ...gate.bucket.profile,
        nickname,
        avatarId,
        updatedAt: clock(),
      }
      if (gate.bucket === guest) publishGuest()

      return serviceOk(copy(gate.bucket.profile))
    },
  }

  const progress: NovaServices['progress'] = {
    async getMissionProgress(missionId) {
      const gate = requireBucket()
      if (!gate.ok) {
        return serviceError(gate.error.code, gate.error.message)
      }

      const parsed = requireMission(missionId)
      if (!parsed.ok) {
        return parsed
      }

      const record = progressFor(gate.bucket, parsed.data)
      if (!record) {
        return serviceError('not-found', 'That mission has no saved progress.')
      }

      return serviceOk(copy(record))
    },

    async getProgressOverview() {
      const gate = requireBucket()
      if (!gate.ok) {
        return serviceError(gate.error.code, gate.error.message)
      }

      const missions = missionIds.map((missionId) => {
        const record = progressFor(gate.bucket, missionId)
        if (!record) {
          throw new Error(`Missing progress for ${missionId}.`)
        }
        return copy(record)
      })

      return serviceOk({ missions })
    },

    async saveCheckpoint(input) {
      const gate = requireBucket()
      if (!gate.ok) {
        return serviceError(gate.error.code, gate.error.message)
      }

      const parsed = requireMission(input.missionId)
      if (!parsed.ok) {
        return parsed
      }

      const checkpoint = requireCheckpoint(input.checkpointId)
      if (!checkpoint.ok) {
        return checkpoint
      }

      if (
        input.completedCheckpointId !== undefined &&
        !isStableKey(input.completedCheckpointId)
      ) {
        return serviceError(
          'invalid-input',
          'Checkpoint names use lowercase letters, numbers, and hyphens.',
        )
      }

      const record = progressFor(gate.bucket, parsed.data)
      if (!record) {
        return serviceError('not-found', 'That mission has no saved progress.')
      }

      if (record.status === 'completed') {
        return serviceError('conflict', 'This mission is already complete.')
      }

      const completed = [...record.completedCheckpointIds]
      if (
        input.completedCheckpointId &&
        !completed.includes(input.completedCheckpointId)
      ) {
        completed.push(input.completedCheckpointId)
      }

      const next: MissionProgress = {
        ...record,
        status: 'in_progress',
        currentCheckpointId: checkpoint.data,
        completedCheckpointIds: completed,
        updatedAt: clock(),
      }
      gate.bucket.progress.set(parsed.data, next)
      if (gate.bucket === guest) publishGuest()
      return serviceOk(copy(next))
    },

    async completeMission(input) {
      const gate = requireBucket()
      if (!gate.ok) {
        return serviceError(gate.error.code, gate.error.message)
      }

      const parsed = requireMission(input.missionId)
      if (!parsed.ok) {
        return parsed
      }

      const record = progressFor(gate.bucket, parsed.data)
      if (!record) {
        return serviceError('not-found', 'That mission has no saved progress.')
      }

      if (record.status === 'not_started') {
        return serviceError(
          'conflict',
          'Start the mission before completing it.',
        )
      }

      const at = clock()
      let next = record
      if (record.status === 'in_progress') {
        next = {
          ...record,
          status: 'completed',
          completedAt: at,
          updatedAt: at,
        }
        gate.bucket.progress.set(parsed.data, next)
      }

      const reward = grant(gate.bucket, parsed.data, 'legacy', at)
      const achievement = unlockAchievement(
        gate.bucket,
        storyAchievementId(parsed.data),
        at,
      )

      return serviceOk({
        progress: copy(next),
        reward,
        achievement,
      })
    },
  }

  const rewards: NovaServices['rewards'] = {
    async grantMilestone(input) {
      const gate = requireBucket()
      if (!gate.ok) {
        return serviceError(gate.error.code, gate.error.message)
      }

      const parsed = requireMission(input.missionId)
      if (!parsed.ok) {
        return parsed
      }

      if (!isMissionMilestoneId(input.milestoneId)) {
        return serviceError(
          'invalid-input',
          'That reward is not one of the four mission milestones.',
        )
      }

      return serviceOk(
        grant(gate.bucket, parsed.data, input.milestoneId, clock()),
      )
    },

    async getXpSummary() {
      const gate = requireBucket()
      if (!gate.ok) {
        return serviceError(gate.error.code, gate.error.message)
      }

      return serviceOk({
        totalXp: gate.bucket.profile.totalXp,
        rank: copy(gate.bucket.profile.rank),
        events: copy(gate.bucket.rewards),
      })
    },

    async listAchievements() {
      const gate = requireBucket()
      if (!gate.ok) {
        return serviceError(gate.error.code, gate.error.message)
      }

      const records = achievementCatalog.map((achievement) => ({
        id: achievement.id,
        missionId: achievement.missionId,
        title: achievement.title,
        description: achievement.description,
        unlockedAt: gate.bucket.achievements.get(achievement.id) ?? null,
      }))

      return serviceOk(records)
    },

    async unlockAchievement(achievementId) {
      const gate = requireBucket()
      if (!gate.ok) {
        return serviceError(gate.error.code, gate.error.message)
      }

      if (!isAchievementId(achievementId)) {
        return serviceError(
          'invalid-input',
          'That achievement is not in the catalog.',
        )
      }

      return serviceOk(unlockAchievement(gate.bucket, achievementId, clock()))
    },

    async unlockDiscovery(input) {
      const gate = requireBucket()
      if (!gate.ok) {
        return serviceError(gate.error.code, gate.error.message)
      }

      const parsed = requireMission(input.missionId)
      if (!parsed.ok) {
        return parsed
      }

      if (!isStableKey(input.discoveryId)) {
        return serviceError(
          'invalid-input',
          'Discovery names use lowercase letters, numbers, and hyphens.',
        )
      }

      const known = discoveryCatalog.find(
        (entry) => entry.discoveryId === input.discoveryId,
      )
      if (known && known.missionId !== parsed.data) {
        return serviceError(
          'invalid-input',
          'That discovery belongs to a different mission.',
        )
      }

      const existing = gate.bucket.journal.find(
        (entry) =>
          entry.missionId === parsed.data &&
          entry.discoveryId === input.discoveryId,
      )
      if (existing) {
        const result: DiscoveryUnlockResult = {
          awarded: false,
          entry: copy(existing),
        }
        return serviceOk(result)
      }

      const entry: JournalEntry = {
        discoveryId: input.discoveryId,
        missionId: parsed.data,
        title: known?.title ?? 'Placeholder discovery',
        summary: journalPlaceholderSummary,
        unlockedAt: clock(),
        contentStatus: 'placeholder',
      }
      gate.bucket.journal.push(entry)
      if (gate.bucket === guest) publishGuest()

      return serviceOk({ awarded: true, entry: copy(entry) })
    },

    async listJournalEntries() {
      const gate = requireBucket()
      if (!gate.ok) {
        return serviceError(gate.error.code, gate.error.message)
      }

      return serviceOk(copy(gate.bucket.journal))
    },
  }

  return { auth, explorer, progress, rewards }
}

function initialSession(
  persona: MockPersona,
  guest: Bucket,
  registered: Account | undefined,
): AuthSession {
  if (persona === 'guest') {
    return {
      status: 'guest',
      identity: {
        explorerId: guest.profile.explorerId,
        kind: 'guest',
      },
    }
  }

  if (persona === 'registered') {
    if (!registered) {
      throw new Error('The mock is missing the registered explorer.')
    }

    return {
      status: 'authenticated',
      identity: {
        explorerId: registered.bucket.profile.explorerId,
        kind: 'registered',
      },
    }
  }

  if (persona === 'initializing') {
    return { status: 'initializing' }
  }

  return { status: 'signed-out' }
}
