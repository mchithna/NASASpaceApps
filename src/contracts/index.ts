export type {
  AuthListener,
  AuthSession,
  AuthStatus,
  ExplorerIdentity,
  ExplorerKind,
  SignInCredentials,
  SignUpCredentials,
} from '@/contracts/auth.ts'
export { authStatuses } from '@/contracts/auth.ts'

export type {
  AvatarId,
  ExplorerProfile,
  ExplorerProfileUpdate,
  ExplorerRankId,
  ExplorerRankSummary,
} from '@/contracts/explorer.ts'
export {
  avatarIds,
  explorerRankLadder,
  isAvatarId,
  rankForXp,
  validateNickname,
} from '@/contracts/explorer.ts'

export { isStableKey, stableKeyMaxLength } from '@/contracts/ids.ts'

export type {
  ActivityCompletionEvent,
  MissionCompletionEvent,
  MissionRuntimeState,
} from '@/contracts/missions.ts'
export { runtimeStateFromProgress } from '@/contracts/missions.ts'

export type {
  MissionCompletionResult,
  MissionProgress,
  MissionProgressOverview,
  MissionProgressStatus,
  SaveCheckpointInput,
} from '@/contracts/progress.ts'
export { missionProgressStatuses } from '@/contracts/progress.ts'

export type {
  ServiceError,
  ServiceErrorCode,
  ServiceResult,
} from '@/contracts/result.ts'
export {
  serviceError,
  serviceErrorCodes,
  serviceOk,
} from '@/contracts/result.ts'

export type {
  AchievementId,
  AchievementRecord,
  AchievementUnlock,
  AchievementUnlockResult,
  CatalogDiscoveryId,
  DiscoveryUnlockRequest,
  DiscoveryUnlockResult,
  JournalContentStatus,
  JournalEntry,
  MilestoneCompletionRequest,
  MilestoneGrant,
  MilestoneXpAmount,
  MissionMilestoneId,
  RewardKey,
  XpRewardEvent,
  XpSummary,
} from '@/contracts/rewards.ts'
export {
  achievementCatalog,
  discoveryCatalog,
  isAchievementId,
  isMissionMilestoneId,
  journalPlaceholderSummary,
  listMissionRewardKeys,
  milestoneXp,
  missionMilestoneIds,
  missionXpCap,
  rewardKeyFor,
  storyAchievementId,
  sumXp,
} from '@/contracts/rewards.ts'

export type {
  AuthService,
  ExplorerService,
  NovaServices,
  ProgressService,
  RewardsService,
} from '@/contracts/services.ts'

export { missionIds, type MissionId } from '@/missions/types.ts'
