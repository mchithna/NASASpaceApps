/**
 * Service interfaces for Phase 2.
 *
 * Identity comes from the session inside the implementation. Methods do not
 * take an explorer id. Methods do not take an XP amount.
 *
 * Writes need server-side or database validation in the real implementation:
 * - Sign-in and sign-up credentials are checked by the auth provider.
 *   Passwords and access tokens are never stored on the profile.
 * - Nickname and avatar are checked again on save.
 * - Mission, checkpoint, milestone, achievement, and discovery ids are checked
 *   against trusted catalogs. A unique reward key stops duplicate XP.
 * - `completeMission` commits completion, the legacy milestone, and the story
 *   achievement in one transaction.
 * - `unavailable` is for network or database failures. Callers must handle it.
 *
 * The mock in `src/mocks/` follows these signatures and is not production storage.
 */

import type {
  AuthListener,
  AuthSession,
  SignInCredentials,
  SignUpCredentials,
} from '@/contracts/auth.ts'
import type {
  ExplorerProfile,
  ExplorerProfileUpdate,
} from '@/contracts/explorer.ts'
import type {
  MissionCompletionResult,
  MissionProgress,
  MissionProgressOverview,
  SaveCheckpointInput,
} from '@/contracts/progress.ts'
import type { ServiceResult } from '@/contracts/result.ts'
import type {
  AchievementRecord,
  AchievementUnlockResult,
  DiscoveryUnlockRequest,
  DiscoveryUnlockResult,
  JournalEntry,
  MilestoneGrant,
  XpSummary,
} from '@/contracts/rewards.ts'

export type AuthService = {
  /** Current session, including initializing, guest, and signed-out. */
  getSession(): Promise<ServiceResult<AuthSession>>
  /** Starts a guest session for this service instance. */
  startGuestSession(): Promise<ServiceResult<AuthSession>>
  /**
   * Signs in with credentials. The provider checks them.
   * Do not log or persist the credentials object.
   */
  signIn(credentials: SignInCredentials): Promise<ServiceResult<AuthSession>>
  /**
   * Creates a registered explorer and signs them in.
   * Do not log or persist the credentials object.
   */
  signUp(credentials: SignUpCredentials): Promise<ServiceResult<AuthSession>>
  signOut(): Promise<ServiceResult<AuthSession>>
  /**
   * Reports later session changes. Does not call the listener immediately.
   * The returned function unsubscribes.
   */
  subscribe(listener: AuthListener): () => void
}

export type ExplorerService = {
  /** Profile for the guest or registered session. */
  getProfile(): Promise<ServiceResult<ExplorerProfile>>
  /**
   * Updates nickname, avatar, or both for the current explorer.
   * Cannot change XP, rank, or identity.
   */
  saveProfile(
    input: ExplorerProfileUpdate,
  ): Promise<ServiceResult<ExplorerProfile>>
}

export type ProgressService = {
  getMissionProgress(missionId: string): Promise<ServiceResult<MissionProgress>>
  getProgressOverview(): Promise<ServiceResult<MissionProgressOverview>>
  /**
   * Saves the resume checkpoint for the current explorer.
   * Rejects unknown missions, unsafe checkpoint ids, and completed missions.
   */
  saveCheckpoint(
    input: SaveCheckpointInput,
  ): Promise<ServiceResult<MissionProgress>>
  /**
   * Marks an in-progress mission complete and grants the legacy milestone
   * and story achievement. A second call does not grant them again.
   */
  completeMission(input: {
    missionId: string
  }): Promise<ServiceResult<MissionCompletionResult>>
}

export type RewardsService = {
  /**
   * Grants one predefined milestone. The XP amount comes from the catalog.
   * The same mission and milestone do not grant XP twice.
   */
  grantMilestone(input: {
    missionId: string
    milestoneId: string
  }): Promise<ServiceResult<MilestoneGrant>>
  getXpSummary(): Promise<ServiceResult<XpSummary>>
  listAchievements(): Promise<ServiceResult<readonly AchievementRecord[]>>
  /**
   * Unlocks a catalog achievement. Real storage must check that the explorer
   * earned it. A second unlock does not create a second record.
   */
  unlockAchievement(
    achievementId: string,
  ): Promise<ServiceResult<AchievementUnlockResult>>
  /**
   * Unlocks a journal discovery. Copy comes from trusted content, not from
   * the caller. The same mission and discovery do not create a second entry.
   */
  unlockDiscovery(
    input: DiscoveryUnlockRequest,
  ): Promise<ServiceResult<DiscoveryUnlockResult>>
  listJournalEntries(): Promise<ServiceResult<readonly JournalEntry[]>>
}

/** The four services the app and the mission engine share. */
export type NovaServices = {
  auth: AuthService
  explorer: ExplorerService
  progress: ProgressService
  rewards: RewardsService
}
