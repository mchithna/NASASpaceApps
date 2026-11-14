/**
 * Deterministic sample data for the mock services.
 * Timestamps are fixed. Journal copy is a placeholder, not a NASA finding.
 */

import { rankForXp } from '@/contracts/explorer.ts'
import type {
  AchievementUnlock,
  ExplorerProfile,
  JournalEntry,
  MissionProgress,
  XpRewardEvent,
} from '@/contracts/index.ts'
import {
  discoveryCatalog,
  journalPlaceholderSummary,
  milestoneXp,
  rewardKeyFor,
  sumXp,
} from '@/contracts/rewards.ts'
import { missionIds, type MissionId } from '@/missions/types.ts'
import type { MissionMilestoneId } from '@/contracts/rewards.ts'

export const mockTime = '2026-01-15T12:00:00.000Z'

export const mockRegisteredCredentials = {
  email: 'nova.cadet@example.com',
  password: 'academy-demo',
} as const

export const mockGuestExplorerId = 'guest-cadet'
export const mockRegisteredExplorerId = 'explorer-nova'

export type MockExplorerSeed = {
  profile: ExplorerProfile
  progress: readonly MissionProgress[]
  rewards: readonly XpRewardEvent[]
  unlockedAchievements: readonly AchievementUnlock[]
  journal: readonly JournalEntry[]
}

function blankProgress(missionId: MissionId): MissionProgress {
  return {
    missionId,
    status: 'not_started',
    currentCheckpointId: null,
    completedCheckpointIds: [],
    completedAt: null,
    updatedAt: mockTime,
  }
}

function reward(
  missionId: MissionId,
  milestoneId: MissionMilestoneId,
): XpRewardEvent {
  return {
    rewardKey: rewardKeyFor(missionId, milestoneId),
    missionId,
    milestoneId,
    xp: milestoneXp[milestoneId],
    awardedAt: mockTime,
  }
}

function profileFor(
  explorerId: string,
  kind: ExplorerProfile['kind'],
  nickname: string,
  avatarId: ExplorerProfile['avatarId'],
  totalXp: number,
): ExplorerProfile {
  return {
    explorerId,
    kind,
    nickname,
    avatarId,
    totalXp,
    rank: rankForXp(totalXp),
    createdAt: mockTime,
    updatedAt: mockTime,
  }
}

export function createGuestSeed(): MockExplorerSeed {
  return {
    profile: profileFor(
      mockGuestExplorerId,
      'guest',
      'Guest Cadet',
      'cadet-1',
      0,
    ),
    progress: missionIds.map((missionId) => blankProgress(missionId)),
    rewards: [],
    unlockedAchievements: [],
    journal: [],
  }
}

export function createRegisteredSeed(): MockExplorerSeed {
  const rewards = [
    reward('surveyor-3', 'introduction'),
    reward('surveyor-3', 'activity'),
    reward('ingenuity', 'introduction'),
    reward('ingenuity', 'activity'),
    reward('ingenuity', 'discovery'),
    reward('ingenuity', 'legacy'),
  ]
  const ingenuityNotes = discoveryCatalog.find(
    (entry) => entry.discoveryId === 'ingenuity-notes',
  )

  if (!ingenuityNotes) {
    throw new Error('Missing ingenuity journal placeholder.')
  }

  const progress = missionIds.map((missionId) => {
    if (missionId === 'surveyor-3') {
      return {
        missionId,
        status: 'in_progress' as const,
        currentCheckpointId: 'evidence',
        completedCheckpointIds: ['opening', 'field-work'],
        completedAt: null,
        updatedAt: mockTime,
      }
    }

    if (missionId === 'ingenuity') {
      return {
        missionId,
        status: 'completed' as const,
        currentCheckpointId: 'farewell',
        completedCheckpointIds: [
          'opening',
          'field-work',
          'evidence',
          'farewell',
        ],
        completedAt: mockTime,
        updatedAt: mockTime,
      }
    }

    return blankProgress(missionId)
  })

  const journal: JournalEntry[] = [
    {
      discoveryId: ingenuityNotes.discoveryId,
      missionId: ingenuityNotes.missionId,
      title: ingenuityNotes.title,
      summary: journalPlaceholderSummary,
      unlockedAt: mockTime,
      contentStatus: 'placeholder',
    },
  ]

  return {
    profile: profileFor(
      mockRegisteredExplorerId,
      'registered',
      'Nova Cadet',
      'cadet-2',
      sumXp(rewards),
    ),
    progress,
    rewards,
    unlockedAchievements: [
      { achievementId: 'ingenuity-story', unlockedAt: mockTime },
    ],
    journal,
  }
}
