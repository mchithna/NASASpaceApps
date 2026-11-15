# Phase 4B Step 5 — security, integrity, and recovery audit

Audit date: 2026-11-15. **Security gate: OPEN for release.** Source hardening and
isolated PostgreSQL tests are separate from verification of a deployed Supabase
project. The connected account returned an empty project list. No hosted migrations,
user creation, data resets, cleanup, commits, pushes, or Git configuration changes
were executed during this step. No new dependencies or chapters were added.

## Evidence and findings

Severity describes the pre-fix risk. “Fixed” means source plus local test evidence;
it does not claim that a database migration has been deployed.

| ID | Severity | Finding, exact affected files, and disposition | Coverage |
| --- | --- | --- | --- |
| S01 | High | Production could accept `isLive=false`, use a seeded mock without a provider, or silently use a training runtime without persistence. Fixed in `src/pages/context/PlatformServicesContext.tsx`, `platformServicesContextValue.ts`, `useNovaServices.ts`, `src/engine/MissionPlayer.tsx`. Production now fails closed; development mock imports are compile-time guarded. | `src/pages/context/productionBoundary.test.tsx`; production build marker scan. |
| S02 | Medium | Concurrent refresh requests could rotate the same refresh token twice; network loss discarded recovery credentials; a late refresh could revive an old identity. Fixed in `src/features/auth/supabaseClient.ts` and `authService.ts`: one in-flight refresh per client, identity comparison before applying responses, retryable errors without discarding credentials on network/5xx/429 failures. | `src/features/auth/securityRecovery.test.ts`. Independent browser-tab refresh coordination remains unverified. |
| S03 | Medium | An old async profile/progress response could repopulate private UI after sign-out or service changes. Fixed in `src/pages/hooks/usePlatformData.ts`: clear previous private state, version requests, discard stale responses, invalidate on cleanup, and subscribe mission progress to auth changes. | `src/pages/securityReadIsolation.test.tsx`; existing shared-page tests. |
| S04 | Medium | Registration ignored profile insert errors; zero-row profile PATCH could be reported as saved. Fixed in `src/features/auth/authService.ts` and `src/features/profiles/explorerService.ts`: inspect insertion result, use idempotent initialization, request PATCH representation and verify exactly the owning row changed. | `securityRecovery.test.ts` tests interrupted registration/profile update and zero-row rejection. |
| S05 | Medium | Registered profile grants covered all writable columns; anonymous Auth users carry the authenticated role. New local migration `supabase/migrations/20261114195728_security_hardening.sql` restricts insert/update columns and excludes anonymous JWTs from registered private-row policies. It adds enforced-on-new-write nickname and exact reward-key/XP constraints, without rewriting existing rows. | `src/features/missionBackend.integration.test.ts` executes all migrations in embedded PostgreSQL and tests RLS/column privileges/anonymous rejection. **Hosted deployment not verified.** |
| S06 | Medium | Public environment values were not checked for privileged Supabase keys before bundling. Added `src/features/auth/publicKey.ts`, used by `vite.config.ts` before building and by the client constructor. Modern secret keys and legacy service-role JWTs fail without logging their contents. | `securityRecovery.test.ts`; sanitized worktree scan found zero suspected private/service-role keys. This is not a complete historical secret audit. |
| S07 | Low | Auth copy promised that registration preserved guest rank, though no account-link/merge exists. Fixed `src/pages/AuthPage.tsx`; removed production demo-credential imports/UI and stated that guest progress is separate. | Existing auth/page tests; build excludes checked demo account markers. |
| S08 | Medium | Hosted tests could use the application's ordinary project merely by setting a live flag, and used an obsolete unrestricted checkpoint. Fixed `src/features/auth/supabaseLive.live.test.ts`: dedicated test URL/key/reference plus an explicit acknowledgement are required; no application-project fallback; unpublished checkpoints/unearned rewards must be denied. | Ordinary suite skips hosted tests. No cleanup/reset exists in that hosted test. Target designation still requires human verification. |
| S09 | High, open gate | The deployed schema, policies, grants, RPC versions, JWT handling, and actual multi-connection reward contention cannot be confirmed without a designated accessible test project. | **NOT VERIFIED live.** Local simulation does not close this gate. |
| S10 | Medium, accepted architectural limit | Activity success and reading completion are client assertions. A user can submit valid sequential callbacks without solving the activity. Server enforcement covers scene membership/order, ownership, milestone eligibility, fixed XP, and uniqueness; it is not proof of learning. Guest tab-local state is editable and never a trusted registered-account XP source. | Review of the Step 4 RPCs, runtime, guest cache, and tests. Stronger answer validation requires a future trusted activity protocol, outside this step. |

The pre-existing best-effort logout clears the local session but does not prove
server-side revocation during a network outage (`src/features/auth/supabaseClient.ts`,
`signOut`). Do not describe it as guaranteed global revocation. Hosted session
expiry/revocation and cross-tab identity/refresh behavior remain acceptance checks.

## Database review

Reviewed the full migration chain:

- `20261114000000_player_systems.sql`: profiles, mission progress, unique XP events,
  achievements, journal; RLS enabled on all five private tables.
- `20261114170000_player_systems_access.sql`: table grants and profile/progress
  protection triggers. The later Step 4 migration supersedes its broad progress,
  journal, and achievement insert/update permissions and unrestricted milestone RPC.
- `20261114180000_player_systems_search_path.sql`: fixed trigger search paths.
- `20261114190549_mission_engine_boundary.sql`: read-only scene catalog with RLS;
  authenticated-only RPC execution; direct outcome writes revoked; profile-first row
  locking; trusted checkpoint membership/order; atomic scene rewards and final
  completion/legacy/achievement. RPC search paths are empty with qualified relations.
- `20261114195728_security_hardening.sql`: restricted profile columns, anonymous
  private-data exclusion, and additional write constraints. **Local only.**

Private policies compare `auth.uid()` with `id`/`user_id`. Update ownership has both
USING and WITH CHECK. No private DELETE grant or DELETE policy is granted to clients.
The authenticated scene catalog SELECT policy is intentional: catalog content is
published chapter metadata, not player data. Anonymous Auth users remain excluded
from registered outcomes; signed-out `anon` has neither private table access nor
reward-RPC EXECUTE permission. No user-editable metadata authorizes writes.

Reward RPCs accept mission/milestone IDs, not identity, amount, caller journal copy,
or arbitrary reward keys. All five IDs are constrained. Reward key is derived as
`mission:milestone`; 20/40/25/15 amounts come from SQL. A unique `(user_id,reward_key)`
and profile row lock serialize rewards for one player, including different missions.
The total is recomputed from unique events inside the same transaction. Discovery
and achievement identifiers are validated against trusted content/completion state;
their uniqueness constraints prevent duplicate records. `completeMission` commits
completion, legacy XP, and story achievement together. The checkpoint RPC also wraps
the ending scene and final completion in its transaction.

The new constraints use NOT VALID: existing rows are not scanned or rewritten, but
new inserts/updates must comply. Validating existing rows and inspecting any historical
XP discrepancies remain deployment gates. No corrective data migration was run.

## Isolation, recovery, and production boundaries

`src/features/missionBackend.integration.test.ts` creates **in-memory PGlite**, with
test Auth functions/UUIDs and synthetic scene catalog rows. It has no database URL,
external connection, production reset, or privileged key. Tests execute the real SQL
migration chain, use non-owner roles, reject cross-user profile reads/updates and
identity changes/deletes, deny signed-out reads/RPCs, reject anonymous registered
writes, forged mission/discovery/achievement IDs, arbitrary amounts, and premature
completion. Failed final writes roll back progress/XP; repeated Promise batches retain
exactly four events and 100 XP, with total matching event sum.

PGlite queues statements on one connection. These are duplicate-request tests, **not
verification of contention between independently connected PostgreSQL transactions**.
The lock/uniqueness argument is code-review evidence until the two-session check below.
Auth claims in PGlite are test settings; they do not test hosted signature validation.

Guest refresh/retry is covered by `src/features/guestMissionResume.test.ts`: new
service/runtime instances restore versioned, serializable tab-local state, repair an
interrupted reward callback, and keep identities separate. Guest progress is never
merged on registration. `src/engine/serviceRuntime.test.tsx` covers failed retries,
duplicate callbacks, invalid checkpoints, identity changes, and disposal. Registered
checkpoint transport failures are covered by `progressService.test.ts`.

`src/pages/missionEngine.integration.test.tsx` exercises the learner flow through
overview, start/resume, completion, exit, dashboard **100 XP / 1 completed mission**,
and replay, plus unavailable saves and invalid checkpoints. It explicitly injects
isolated mocks; the separate SQL test exercises the real Phase 2 service methods with
an embedded database transport. Shared pages expose service errors and a retry path.

Production provider defaults remain real services even without configuration; mock
mode/unverified overrides and missing providers throw. An unconfigured production
guest cannot be silently invented. `/dev/components` and `/dev/training-simulator`
are DEV-only; `src/app/productionRoutes.test.tsx` verifies production navigation falls
through to Not Found. `training-simulator` remains outside the five-mission registry.
No factual mission package, scene, visual design, or XP policy was changed.

Browser acceptance is **NOT VERIFIED in this step**. The previous step's connector
timeouts and automatic denial of Chrome control remain unresolved; no additional
browser authorization was assumed. Component tests are the closest available check.

## Live verification instructions — gate remains open

First obtain a separately designated test project and verify its reference in the
Dashboard. Do not set the variables below to the production project. Inspect/apply
the reviewed pending migrations through the normal integration-owner workflow;
neither their presence in Git nor these local results establish deployment.
Coordinate rollout: the Step 5 client writes only allowed profile fields and is
compatible with the older grants. Ship that client before tightening profile grants;
older clients that still send kind, XP, or timestamps will have those writes rejected.

Read-only inventory in the selected project's SQL editor:

```sql
BEGIN READ ONLY;
SELECT c.relname, c.relrowsecurity FROM pg_class c
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relname IN
 ('profiles','mission_progress','xp_reward_events','unlocked_achievements','journal_entries','mission_scene_catalog');
SELECT tablename, policyname, roles, cmd, qual, with_check FROM pg_policies
WHERE schemaname='public';
SELECT grantee, table_name, privilege_type FROM information_schema.role_table_grants
WHERE table_schema='public' AND grantee IN ('anon','authenticated');
SELECT grantee, table_name, column_name, privilege_type FROM information_schema.column_privileges
WHERE table_schema='public' AND grantee IN ('anon','authenticated');
SELECT p.oid::regprocedure, p.prosecdef, p.proconfig, p.proacl FROM pg_proc p
JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public';
SELECT conname, convalidated FROM pg_constraint WHERE conrelid IN
 ('public.profiles'::regclass,'public.xp_reward_events'::regclass);
SELECT count(*) AS inconsistent_totals FROM public.profiles p WHERE p.total_xp <>
 (SELECT coalesce(sum(e.xp),0) FROM public.xp_reward_events e WHERE e.user_id=p.id);
COMMIT;
```

Use two fresh registered test explorers with separate client sessions. With A's
publishable-key client and A's JWT, GET B's profile/progress must return no rows;
PATCH B's nickname with `Prefer: return=representation` must return no rows; DELETE
must be denied. With no JWT, private GET and all outcome RPCs must be denied. Repeat
with an anonymous Auth JWT. Do not log JWTs, passwords, or API keys. Confirm that an
expired/rejected session cannot read or write through the Data API.

For test-project signup/read isolation checks only, in an untracked local test env:

```text
VITE_SUPABASE_LIVE_TESTS=true
VITE_SUPABASE_TEST_URL=https://<TEST_PROJECT_REF>.supabase.co
VITE_SUPABASE_TEST_PUBLISHABLE_KEY=<TEST_PUBLISHABLE_KEY>
VITE_SUPABASE_TEST_PROJECT_REF=<TEST_PROJECT_REF>
VITE_SUPABASE_TEST_ACK=isolated-test-only
```

```powershell
npm test -- --maxWorkers=1 --testTimeout=30000 src/features/auth/supabaseLive.live.test.ts
```

This opt-in creates test auth users and performs no cleanup. Do not run it before
target verification/authorization. It intentionally does not install sample reward
catalogs or award canonical XP. No reset/cleanup tool defaults to a hosted project.

For contention, use **two independent connections on the approved test database**
and an isolated eligible test explorer/manifest. In session A: BEGIN, set the test
auth claims using transaction-local settings, call
`SELECT public.rpc_grant_milestone('<mission>','activity');`, and hold the transaction.
In session B, call the same RPC with the same test identity. B must block until A
commits, then return awarded=false. Repeat with two different eligible milestones,
and simultaneous ending completion. Verify one record per canonical key, one journal
record per discovery, one story achievement, and `total_xp = SUM(xp)` at at most 100
per mission. Kill a request/lose a response after commit, reload, and retry. No new
XP or duplicate records may appear. Fixture creation/removal requires explicit test
environment authorization; no cleanup SQL is provided for production use.

Finally check the actual browser: offline profile/checkpoint writes show failure,
reconnection/reload recovers the saved scene, completion refreshes dashboard/journal/
achievements, guest same-tab refresh restores its local state, and sign-out never
repopulates the previous player's data. Verify production `/dev/*` is Not Found.

## Files changed in Step 5

- Audit/status: this file, `AGENTS.md`, `PROJECT_CONTEXT.md` (additive status only).
- Configuration: `vite.config.ts`; no package or lockfile changes.
- Auth: `src/features/auth/publicKey.ts`, `supabaseClient.ts`, `authService.ts`,
  `securityRecovery.test.ts`, `supabaseLive.live.test.ts`.
- Profiles/SQL: `src/features/profiles/explorerService.ts`,
  `supabase/migrations/20261114195728_security_hardening.sql`,
  `src/features/missionBackend.integration.test.ts`.
- UI/service boundary: `src/pages/AuthPage.tsx`, `src/pages/hooks/usePlatformData.ts`,
  `src/pages/context/PlatformServicesContext.tsx`, `platformServicesContextValue.ts`,
  `useNovaServices.ts`, `productionBoundary.test.tsx`, `src/engine/MissionPlayer.tsx`.
- Additional coverage: `src/app/productionRoutes.test.tsx`,
  `src/pages/securityReadIsolation.test.tsx`, `src/pages/missionEngine.integration.test.tsx`,
  `src/pages/AuthOnboarding.test.tsx` (updated guest/mock disclosure assertions).

Pre-existing Step 4 changes/report and other working-tree edits were preserved.

## Verification results

Final command results are recorded here after execution. The security gate stays
open regardless of local success until the hosted and browser checks above pass.

- `npm run lint`: passed after correcting the initial synchronous-effect lint finding.
- `npm run typecheck`: passed. A later final-guard type argument was rejected, removed,
  and the corrected source passed typecheck and the build's TypeScript stage.
- `npm test -- --maxWorkers=2 --testTimeout=30000`: 207 passed, 2 hosted tests skipped,
  35 passing files and one skipped file. This full run preceded the final missing-service
  production-player guard; its focused production-boundary run passed all 4 tests.
- `npm test -- --maxWorkers=1 --testTimeout=30000 src/features/auth/securityRecovery.test.ts`:
  6 passed, including privileged-key whitespace handling.
- The focused SQL/production/identity/route/auth security run passed 19 tests.
- Final `npm test -- --maxWorkers=1 --testTimeout=30000 src/pages/AuthOnboarding.test.tsx src/pages/context/productionBoundary.test.tsx`:
  12 passed after updating the obsolete mock-notice assertion for the corrected guest
  disclosure. That assertion initially failed; no failing local check remains.
- `npm run build`: passed after the type correction. Existing mission-package static/
  dynamic import chunk warnings remain; they do not affect routing or authorization.
- `git diff --check`: passed, with line-ending normalization notices only.
- Sanitized source and local-env scan: zero suspected modern secret keys, private-key
  blocks, or literal service-role JWTs; no credential values printed. History and remote
  configuration are not included. If a privileged key was previously published, it
  must be revoked/rotated; deleting its text alone would not resolve exposure.
- Production artifact scan excluded the checked training scene/route, demo-account,
  demo-password, mock-credential symbol, and PGlite markers.
- Supabase `list_projects`: empty. Hosted RLS/JWT/transaction tests and advisors:
  **NOT VERIFIED**. No hosted-test flag was enabled.
- Browser acceptance: **NOT VERIFIED**; component interaction tests are the substitute.

Next recommended prompt: close the Step 5 hosted security and browser acceptance gates
using an explicitly designated test project, then request Step 6 separately. Do not
deploy/reset production or start another development step from this audit.
