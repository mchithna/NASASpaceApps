/**
 * Explorer profile and the rank ladder.
 * Rank is derived from XP. Callers cannot set XP on a profile update.
 */

import type { ExplorerKind } from '@/contracts/auth.ts'
import {
  serviceError,
  serviceOk,
  type ServiceResult,
} from '@/contracts/result.ts'

export const avatarIds = ['cadet-1', 'cadet-2', 'cadet-3', 'cadet-4'] as const

export type AvatarId = (typeof avatarIds)[number]

export function isAvatarId(value: string): value is AvatarId {
  return (avatarIds as readonly string[]).includes(value)
}

export const explorerRankLadder = [
  { id: 'space-cadet', name: 'Space Cadet', minXp: 0 },
  { id: 'lunar-explorer', name: 'Lunar Explorer', minXp: 100 },
  { id: 'planetary-explorer', name: 'Planetary Explorer', minXp: 200 },
  { id: 'mission-specialist', name: 'Mission Specialist', minXp: 300 },
  { id: 'deep-space-explorer', name: 'Deep Space Explorer', minXp: 400 },
  { id: 'legacy-guardian', name: 'Legacy Guardian', minXp: 500 },
] as const

export type ExplorerRankId = (typeof explorerRankLadder)[number]['id']

export type ExplorerRankSummary = {
  /** 1 for Space Cadet through 6 for Legacy Guardian. */
  level: number
  id: ExplorerRankId
  name: string
  minXp: number
  totalXp: number
  nextRankId: ExplorerRankId | null
  nextRankName: string | null
  nextRankMinXp: number | null
  xpUntilNextRank: number | null
}

const nicknamePattern = /^[\p{L}\p{N}]+(?:[ '-][\p{L}\p{N}]+)*$/u

export function validateNickname(value: string): ServiceResult<string> {
  const nickname = value.trim()

  if (nickname.length < 2 || nickname.length > 20) {
    return serviceError(
      'invalid-input',
      'Use a nickname between 2 and 20 characters.',
    )
  }

  if (!nicknamePattern.test(nickname)) {
    return serviceError(
      'invalid-input',
      'Nicknames can use letters, numbers, spaces, apostrophes, and hyphens.',
    )
  }

  return serviceOk(nickname)
}

/** Rank and level for a non-negative whole XP total. */
export function rankForXp(totalXp: number): ExplorerRankSummary {
  if (!Number.isSafeInteger(totalXp) || totalXp < 0) {
    throw new RangeError('XP must be a whole number of 0 or more.')
  }

  let index = 0
  for (
    let rankIndex = 0;
    rankIndex < explorerRankLadder.length;
    rankIndex += 1
  ) {
    const rank = explorerRankLadder[rankIndex]
    if (rank && totalXp >= rank.minXp) {
      index = rankIndex
    }
  }

  const current = explorerRankLadder[index]
  if (!current) {
    throw new RangeError('The rank ladder is empty.')
  }

  const next = explorerRankLadder[index + 1] ?? null

  return {
    level: index + 1,
    id: current.id,
    name: current.name,
    minXp: current.minXp,
    totalXp,
    nextRankId: next?.id ?? null,
    nextRankName: next?.name ?? null,
    nextRankMinXp: next?.minXp ?? null,
    xpUntilNextRank: next ? next.minXp - totalXp : null,
  }
}

export type ExplorerProfile = {
  explorerId: string
  kind: ExplorerKind
  nickname: string
  avatarId: AvatarId
  totalXp: number
  rank: ExplorerRankSummary
  createdAt: string
  updatedAt: string
}

/** Fields a player may change. XP, rank, and identity are not included. */
export type ExplorerProfileUpdate = {
  nickname?: string
  avatarId?: string
}
