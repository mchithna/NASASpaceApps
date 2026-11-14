# Phase 2: Supabase Schema to Contract Mapping

## Database Entities & Mappings

### 1. `public.profiles` -> `ExplorerProfile` (`src/contracts/explorer.ts`)
| Database Column | Contract Field | Type / Notes |
|---|---|---|
| `id` (UUID) | `explorerId` | Mapped to `explorerId` string |
| `kind` (TEXT) | `kind` | `'guest'` or `'registered'` |
| `nickname` (TEXT) | `nickname` | Validated by `validateNickname` (2-20 chars) |
| `avatar_id` (TEXT) | `avatarId` | Validated by `isAvatarId` ('cadet-1'..'cadet-4') |
| `total_xp` (INT) | `totalXp` | Server-authoritative; client cannot directly write |
| derived | `rank` | Computed via `rankForXp(totalXp)` |
| `created_at` (TIMESTAMPTZ) | `createdAt` | ISO-8601 string |
| `updated_at` (TIMESTAMPTZ) | `updatedAt` | ISO-8601 string |

### 2. `public.mission_progress` -> `MissionProgress` (`src/contracts/progress.ts`)
| Database Column | Contract Field | Type / Notes |
|---|---|---|
| `mission_id` (TEXT) | `missionId` | Fixed 5 IDs: `'surveyor-3'`, `'opportunity'`, `'ingenuity'`, `'insight'`, `'pioneer-10'` |
| `status` (TEXT) | `status` | `'not_started'`, `'in_progress'`, `'completed'` |
| `current_checkpoint_id` | `currentCheckpointId` | Stable kebab-case key (<=64 chars) or null |
| `completed_checkpoint_ids` | `completedCheckpointIds` | Array of stable keys |
| `completed_at` | `completedAt` | ISO-8601 string or null |
| `updated_at` | `updatedAt` | ISO-8601 string |

### 3. `public.xp_reward_events` -> `XpRewardEvent` (`src/contracts/rewards.ts`)
| Database Column | Contract Field | Type / Notes |
|---|---|---|
| `reward_key` (TEXT) | `rewardKey` | Formatted as `${missionId}:${milestoneId}` |
| `mission_id` (TEXT) | `missionId` | Foreign/check key |
| `milestone_id` (TEXT) | `milestoneId` | `'introduction'`, `'activity'`, `'discovery'`, `'legacy'` |
| `xp` (INT) | `xp` | Strict amounts: 20, 40, 25, 15 |
| `awarded_at` (TIMESTAMPTZ) | `awardedAt` | ISO-8601 string |

### 4. `public.unlocked_achievements` -> `AchievementUnlock` / `AchievementRecord`
| Database Column | Contract Field | Type / Notes |
|---|---|---|
| `achievement_id` (TEXT) | `id` / `achievementId` | Matches `achievementCatalog` IDs |
| `unlocked_at` (TIMESTAMPTZ) | `unlockedAt` | ISO-8601 string |

### 5. `public.journal_entries` -> `JournalEntry` (`src/contracts/rewards.ts`)
| Database Column | Contract Field | Type / Notes |
|---|---|---|
| `discovery_id` (TEXT) | `discoveryId` | Stable kebab-case key |
| `mission_id` (TEXT) | `missionId` | Fixed mission ID |
| `title` (TEXT) | `title` | Trusted catalog title |
| `summary` (TEXT) | `summary` | Trusted catalog summary / placeholder |
| `content_status` (TEXT) | `contentStatus` | `'placeholder'` or `'sourced'` |
| `unlocked_at` (TIMESTAMPTZ) | `unlockedAt` | ISO-8601 string |

---

## Security Definer RPC Functions
- `public.rpc_grant_milestone(p_mission_id, p_milestone_id)`:
  - Idempotent milestone reward grant.
  - Updates profile `total_xp` authoritatively.
- `public.rpc_complete_mission(p_mission_id)`:
  - Atomic transaction setting progress to `completed`, granting `legacy` milestone (15 XP), and unlocking the mission story achievement.
