# Phase 2: Player Systems — Contract-to-Implementation Map

## 1. Baseline and Ownership Boundary
- **Branch:** `feature/player-system`
- **Baseline Commit:** `ade04d7` ("update project structure with shared contracts and mock services")
- **Builder A Owned Directories:**
  - `src/features/auth/`
  - `src/features/profiles/`
  - `src/features/progress/`
  - `src/features/achievements/`
  - `src/features/journal/` (or internal journal persistence module within owned features)
  - `supabase/migrations/`
  - Feature-level tests inside owned feature directories
- **Protected Files (Do Not Edit):**
  - `src/contracts/`
  - `src/app/`
  - `src/components/ui/`
  - `src/engine/`
  - `src/pages/`
  - `src/missions/`
  - `src/styles/`
  - `package.json` and `package-lock.json`
  - `AGENTS.md`, `PROJECT_CONTEXT.md`, `docs/PARALLEL_DEVELOPMENT.md`

---

## 2. Shared Contract to Implementation Mapping

| Shared Service Interface | Location in `src/contracts/` | Phase 2 Implementation Target | Server/Database vs Client Utility |
|---|---|---|---|
| `AuthService` (`getSession`, `startGuestSession`, `signIn`, `signUp`, `signOut`, `subscribe`) | `src/contracts/services.ts` & `src/contracts/auth.ts` | `src/features/auth/supabaseAuthService.ts` | Auth session and tokens handled by Supabase Auth (GoTrue). Anonymous guest signIn via Supabase Anonymous Auth or session cookies. Never expose or store raw passwords/tokens in profiles or local storage. |
| `ExplorerService` (`getProfile`, `saveProfile`) | `src/contracts/services.ts` & `src/contracts/explorer.ts` | `src/features/profiles/supabaseExplorerService.ts` | Profile data stored in `public.profiles`. Identity extracted from authenticated session token (`auth.uid()`). `validateNickname` and `isAvatarId` are client-side & database-checked validation utilities. Total XP and rank are server-authoritative. |
| `ProgressService` (`getMissionProgress`, `getProgressOverview`, `saveCheckpoint`, `completeMission`) | `src/contracts/services.ts` & `src/contracts/progress.ts` | `src/features/progress/supabaseProgressService.ts` | Mission progress stored in `public.mission_progress`. Scoped by `user_id = auth.uid()`. `completeMission` is an atomic database RPC / transaction combining progress completion, `legacy` milestone (15 XP), and story achievement unlock. Checkpoints enforce monotonic updates. |
| `RewardsService` (`grantMilestone`, `getXpSummary`, `listAchievements`, `unlockAchievement`, `unlockDiscovery`, `listJournalEntries`) | `src/contracts/services.ts` & `src/contracts/rewards.ts` | `src/features/achievements/supabaseRewardsService.ts` (combining achievements, milestones, and journal persistence) | Milestones stored in `public.xp_reward_events` with unique constraint `(user_id, reward_key)`. Total XP computed authoritatively in database. Achievements stored in `public.unlocked_achievements`. Journal entries stored in `public.journal_entries`. All writes idempotent. |

---

## 3. Atomic Operations and Idempotency Structures

1. **Milestone XP Grants (`grantMilestone`):**
   - **Idempotency Key:** `RewardKey` formatted as `<mission_id>:<milestone_id>` (e.g. `surveyor-3:introduction`).
   - **Database Constraint:** `UNIQUE(user_id, reward_key)` on table `public.xp_reward_events`.
   - **Behavior:** Repeated calls return `{ awarded: false, xpAwarded: 0, ... }` with the existing event record and current total XP, without inflating score.
   - **XP Values:** Hardcoded in database function / strictly validated against Phase 1.5 catalog (`20, 40, 25, 15`). Clients cannot submit an XP number.

2. **Mission Completion (`completeMission`):**
   - **Atomicity:** Single database transaction (`complete_mission` RPC).
   - Updates `public.mission_progress` to status `completed`, sets `completed_at = now()`.
   - Inserts `legacy` milestone into `public.xp_reward_events` (15 XP) if not already present.
   - Inserts story achievement (`<mission_id>-story`) into `public.unlocked_achievements` if not already present.
   - Updates `public.profiles` total XP and rank authoritatively.

3. **Checkpoint Updates (`saveCheckpoint`):**
   - Checks that mission is in progress and checkpoint ID conforms to `isStableKey`.
   - Idempotently appends `completed_checkpoint_id` to array `completed_checkpoint_ids` without duplicates.
   - Prevents regressions or overwriting already-completed missions.

4. **Achievement and Journal Unlocks (`unlockAchievement`, `unlockDiscovery`):**
   - `UNIQUE(user_id, achievement_id)` and `UNIQUE(user_id, mission_id, discovery_id)`.
   - Repeated calls return `{ awarded: false }` safely without error or mutation.

---

## 4. Supabase Credentials and Configuration Requirements

- **Client Environment Variables:**
  - `VITE_SUPABASE_URL`: Public Supabase Project REST/Auth base URL.
  - `VITE_SUPABASE_ANON_KEY`: Public Supabase Anonymous (publishable) Key.
- **Safety:**
  - NO `service_role` key in frontend code, git tracking, or environment files.
  - All client requests authenticated via JWT Bearer token issued by Supabase Auth.
- **Fallback / Mock Mode:**
  - When environment variables are missing or network is unavailable, services can be instantiated with mock transport or gracefully report `unavailable` as defined in `ServiceErrorCode`.
