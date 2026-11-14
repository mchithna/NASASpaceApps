# Phase 2 Handover: Player Systems

## 1. Overview and Executive Summary
Builder A has completed Phase 2: Player Systems for NovaExplorer (`feature/player-system`). All services fully implement the Phase 1.5 shared contracts (`src/contracts/`), supporting guest-first access, session recovery, persistent profiles with server-authoritative XP and ranks, monotonic mission checkpoints for all five fixed missions, idempotent milestone rewards, story achievements, and Discovery Journal persistence.

---

## 2. Environment Variables & Setup
Configuration relies strictly on standard public environment variables in `.env.example`:
- `VITE_SUPABASE_URL`: Public Supabase REST/Auth API URL (e.g. `https://xyzcompany.supabase.co`)
- `VITE_SUPABASE_ANON_KEY`: Public anonymous/publishable key.

**Security Safeguards:**
- NO service-role keys are referenced or stored.
- Direct client writes to `total_xp` or unauthorized rewards are blocked by Row Level Security (RLS) and database trigger restrictions.
- In offline/demo mode without live credentials, services seamlessly maintain state and session integrity without throwing runtime exceptions.

---

## 3. Database Schema and Migrations
Located in `supabase/migrations/20261114000000_player_systems.sql`:
1. `public.profiles`: Explorer profiles scoped to `auth.users(id)` with nickname and avatar checks.
2. `public.mission_progress`: Progress tracking per `(user_id, mission_id)` with monotonic checkpoint arrays.
3. `public.xp_reward_events`: Unique `(user_id, reward_key)` ensuring at-most-once milestone XP.
4. `public.unlocked_achievements`: Unique `(user_id, achievement_id)` tracking completed story badges.
5. `public.journal_entries`: Unique `(user_id, mission_id, discovery_id)` tracking unlocked educational notes.
6. **Security Definer RPCs:**
   - `public.rpc_grant_milestone(p_mission_id, p_milestone_id)`
   - `public.rpc_complete_mission(p_mission_id)`
   - `public.check_profile_update()` trigger blocking client writes to `total_xp`.

---

## 4. Service Factories and Exports
All services are exported from `src/features/index.ts`:
- `createPlayerServices(options?: PlayerServicesOptions): NovaServices`
- `createAuthService(options?: AuthServiceOptions): AuthService`
- `createExplorerService(options?: ExplorerServiceOptions): ExplorerService`
- `createProgressService(options?: ProgressServiceOptions): ProgressService`
- `createRewardsService(options?: RewardsServiceOptions): RewardsService`
- `getSupabaseClient(config?: Partial<SupabaseConfig>): SupabaseClient`

---

## 5. Contract Conformance & Error Semantics
All service methods return `Promise<ServiceResult<T>>` using the shared result types:
- `ok: true, data: T` on success.
- `ok: false, error: { code: ServiceErrorCode, message: string }` on failure.
- Normalized error codes strictly adhere to:
  - `unauthenticated`: Action attempted without active session.
  - `invalid-input`: Validation failure (bad nickname, invalid mission, unknown checkpoint).
  - `not-found`: Requested resource does not exist.
  - `conflict`: Progress state violation (e.g. attempting to save checkpoint on already-completed mission, or completing before starting).
  - `unavailable`: Network or database failure.

---

## 6. Verification and Test Results
Ran test suites using Vitest and TypeScript:
- Total tests passing: 70 tests across 14 test suites.
- `npm run typecheck`: Passed (clean exit, zero TypeScript errors).
- `npm run lint`: Passed (clean exit, zero ESLint warnings or errors).
- `npm test`: Passed (all unit and integration suites passing).

---

## 7. Instructions for Phase 4B Integration Owner
In Phase 4B, the integration owner will wire the application together:
1. Wrap root `AppProviders` (`src/app/providers/AppProviders.tsx`) with a provider providing `NovaServices`:
   ```tsx
   import { createPlayerServices } from '@/features/index.ts'

   const playerServices = createPlayerServices()
   ```
2. Builder B's UI and Builder C's Mission Engine can now consume `playerServices` instead of mocks.
3. If `@supabase/supabase-js` is added to `package.json` in Phase 4B, `SupabaseClient` can either be retained as zero-dependency client or updated to wrap the npm package without changing any feature service signature.
