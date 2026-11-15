# Phase 4B, Step 4 — mission service integration

Status: implementation prepared; hosted deployment and browser acceptance remain open.
This report supersedes the Phase 4A handover's proposed production wiring. It does
not authorize Step 5 or factual chapter work.

## Inspected baseline

Read AGENTS.md, PROJECT_CONTEXT.md, PARALLEL_DEVELOPMENT.md, both builder handovers,
the auth/rewards integration notes, engine types/player/registries/adapters/training,
routes, shared contracts, Phase 2 services, and all existing migrations. No separate
Step 1–3 integration log was present. Git history contained the three builder merges
and subsequent provider/auth integration. The working tree was initially clean.

## Package and route boundary

The existing five-mission registry remains authoritative. `loadMissionChapter` first
checks that registry, then loads that package's `index.ts` using Vite's static glob.
Unknown IDs, including `training-simulator`, remain Not Found on public routes.
All five packages currently have metadata only. Their play screens report that the
chapter is being prepared and perform no progress/reward writes.

A chapter developer exports `chapter` from their own `index.ts`, using
`satisfies MissionChapter` from `src/missions/chapter.ts`. Its fields are `scenes`
and `activities`. Scenes use the existing `EngineScene` union. Activities use
`defineActivity<Config>` and `createActivityRegistry`, optionally including
`builtinActivityRegistrations`. Timeline, rover, flight, seismic, and radio activities
can each register different stable type keys without router/player changes.
Config remains flat and serializable; the activity implements any further config
validation. No chapter component should import feature services or Supabase.

The overview reads progress for Start/Continue/Replay. The play page uses the same
provider services as the dashboard, verifies identity, loads saved progress, and
mounts MissionPlayer with the module-aware runtime. Exit returns to `/dashboard`.
Reload saved place creates a new visit and rereads the service after a failure.
Auth changes unmount the previous visit. The runtime checks the visit's explorer
identity before effects and is disposed on exit/reload/auth changes. A missing production configuration fails
closed at the player rather than offering a local visit as persisted account data.

## Persistent state and recovery

The authoritative service interfaces were preserved. Persisted engine state is only
mission ID, status, current scene/checkpoint ID, completed scene IDs, and timestamps.
No React nodes, callbacks, activity objects, arbitrary physics state, or XP input is
serialized. Unfinished activity attempts restart; completed activities resume as done.
Resume rejects unknown IDs, duplicate/gapped completions, and locked destinations.
Completed replay makes no engine writes. Navigating back and forward during a partial
visit still saves the current position (checkpoint writes are not permanently cached).

The module-aware runtime validates effects against the chapter before any write and
applies checkpoint evidence first. The registered backend checkpoint RPC commits the
scene, first eligible milestone, and all newly completed discoveries in one transaction.
The ending checkpoint also commits final completion, legacy XP, and achievement in that
transaction. Subsequent engine reward/completion calls are idempotent confirmations.
A reload reads the committed position even if a response was lost. An interrupted older
ending state is completed through the existing `completeMission` service on load.
The synchronous player guard and runtime in-flight ledger suppress rapid callbacks;
database row locks and unique keys provide durable reward idempotency.

## Backend deployment and publication

`20261114190549_mission_engine_boundary.sql` was generated with the Supabase CLI.
It is **not applied to a hosted project**. The connected Supabase project inventory
returned no projects. Docker's daemon was unavailable. No credentials were printed,
no hosted users were created, and no data was reset or cleaned up.

The migration adds a read-only trusted scene catalog, no sample rows. For a future
chapter release, publish its reviewed manifest through an integration-owned migration:
one row per scene, matching package IDs/order/kind, with reviewed discovery ID/title/
summary/content status on discovery rows. Keep IDs immutable once released. The
catalog rejects unknown missions and malformed IDs; the RPC rejects incomplete
sequences. Content publication needs a matching backend manifest; exporting client
scenes alone cannot create trusted rewards. This does not require editing the router
or engine. Never publish the training manifest to a real-user database.

Registered writes now call `rpc_save_checkpoint`, `rpc_grant_milestone`,
`rpc_unlock_discovery`, `rpc_unlock_achievement`, and `rpc_complete_mission`.
RPCs derive ownership from `auth.uid()`, reject anonymous reward writes, lock the
profile before progress/rewards, validate eligibility against trusted scenes, and
use the fixed 20/40/25/15 policy. Direct progress, achievement, and journal writes
are revoked. Own-row reads remain protected by RLS. Journal copy comes from the
trusted catalog, not caller text. Repeated requests return existing records.
The completion service derives the missing rank field from the backend total using
the single shared `rankForXp` helper.

The original migration had a duplicate LANGUAGE clause on `check_profile_update`.
That syntax was corrected so a clean database can execute the full migration chain;
already-applied installations need only the new migration.

## Trust limits and call modes

These controls are **not cheat-proof**. Activity success and reading completion are
client assertions. The server enforces published scene order, ownership, milestone
eligibility, fixed amounts, transactional outcomes, and uniqueness. It cannot prove
that a learner read a passage or solved a browser activity. Server-side answer/physics
verification would require a future trusted activity protocol.

Production provider selection remains real Phase 2 services; there is no production
training route. Registered calls use Supabase when configured. Development without
credentials uses the pre-existing, visibly labeled mock mode. Real guest services save
versioned, explicitly serializable progress/reward snapshots in sessionStorage, scoped
to the guest identity. Refresh in the same tab restores them when the anonymous auth
session is restored. Closing the tab or clearing browser data can remove them. Guest
profile customization remains in memory. Guest outcomes never merge into registered
account totals. Storage write failures return unavailable rather than claiming a save.
Guest writes have no trusted database transaction; replaying deterministic outcomes
from completed scenes on load repairs interrupted reward/discovery/final callbacks.
The guest cache is editable by that browser's user and is not a trusted XP source.

`/dev/training-simulator` is compiled only in development. It constructs its own
`createMockServices({ persona: 'guest' })` and never consumes the app's service provider.
`trainingScenarioId` is `training-simulator`; its internal Surveyor metadata alias
exists only in that isolated adapter. Its 100 practice XP and badges cannot reach a
real user's totals. A refresh intentionally resets this test scenario.

## Validation and remaining acceptance

The embedded PGlite PostgreSQL tests execute the actual migration chain with test-only
Auth functions and users. They cover locked/unknown scenes, fixed rewards, repeated
callbacks, partial progress, transactional rollback, discoveries, completion/replay,
RLS identity separation, anonymous rejection, and the actual Phase 2 service methods
through an embedded SQL transport. This does not test hosted JWT validation or
multi-connection concurrency. Profile locking must also be exercised on the test
Supabase project before release.

Route tests explicitly inject isolated mocks and a structural chapter export to cover
overview/start, resume with a new runtime, repeated activity callbacks, completion,
dashboard exit, replay, unavailable saves, unknown saved checkpoints, missing chapter,
and invalid public mission IDs. Existing keyboard and scene tests remain relevant.

The browser connector failed to initialize twice. A native Windows fallback could
list browser windows, but automatic approval review rejected control of Google Chrome
with “Computer Use was not approved to use Google Chrome.” No browser input was
approved. Desktop/mobile rendering, visual
contrast, reduced motion, and browser reload against hosted registered services are
not browser-verified. No NASA facts, generated imagery, or mission stories were added.
The source used the existing design tokens, semantic controls, attribution, and motion
rules. Activity scenes now retain citation/media/framing labels in the shared shell.

Before accepting this step: run the checks below; apply the reviewed migration to an
explicitly designated test project; verify registered sign-in and a test-only fixture
there (never real-user sample rewards); check concurrent tabs and lost responses;
complete browser/mobile/keyboard/reduced-motion acceptance, including guest refresh.
Keep the step unaccepted until those gates are addressed.

```powershell
npm run lint
npm run typecheck
npm test -- --maxWorkers=2 --testTimeout=30000
npm run build
```

No commit, push, merge, tag, Git configuration change, or destructive hosted migration
was performed. The only new dependency is test-only `@electric-sql/pglite`.

Next recommended prompt: finish Step 4 acceptance on a designated Supabase test project
and in a working browser; do not start Step 5 or chapter development automatically.

## Files touched

| Area | Files |
| --- | --- |
| Status and handover | `AGENTS.md`, `PROJECT_CONTEXT.md`, `docs/PHASE4B_STEP4.md` |
| Test dependency | `package.json`, `package-lock.json` (`@electric-sql/pglite` 0.5.16 only) |
| Package loading and route | `src/missions/chapter.ts`, `src/app/router.tsx` |
| Engine | `src/engine/MissionPlayer.tsx`, `src/engine/serviceRuntime.ts`, `src/engine/serviceRuntime.test.tsx`, `src/engine/validateModule.ts`, `src/engine/training/trainingSimulator.ts` |
| Player services | `src/features/progress/progressService.ts`, `src/features/progress/progressService.test.ts`, `src/features/achievements/rewardsService.ts`, `src/features/serviceFailure.ts`, `src/features/guestSessionCache.ts` |
| New service integration tests | `src/features/guestMissionResume.test.ts`, `src/features/missionBackend.integration.test.ts` |
| Pages and shared reads | `src/pages/MissionPlayerPage.tsx`, `src/pages/MissionOverviewPage.tsx`, `src/pages/DashboardPage.tsx`, `src/pages/OnboardingPage.tsx`, `src/pages/ProfilePage.tsx`, `src/pages/hooks/usePlatformData.ts` |
| Page tests | `src/pages/missionEngine.integration.test.tsx`, `src/pages/phase4bServicesIntegration.test.tsx`, `src/pages/ProfileJournalAchievements.test.tsx` |
| SQL | `supabase/migrations/20261114000000_player_systems.sql` (syntax fix only), `supabase/migrations/20261114190549_mission_engine_boundary.sql` |

## Recorded checks

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed. Vite warns that mission package imports are both static and dynamic, so those packages are not split into separate chunks. This does not change registry membership or persistence.
- `npm test -- --maxWorkers=2 --testTimeout=30000`: **195 passed, 2 skipped**, 31 passing files and one skipped hosted-test file. No live-test flag was enabled.
- Focused route/backend/guest/runtime/shared-page run: 36 passed before the final full run.
- `git diff --check`: passed; Git emitted only line-ending normalization notices.
- Earlier development runs failed on the original SQL language duplication and obsolete transport/copy expectations; those were corrected. Default-timeout full runs were interrupted after timeouts; the final bounded-worker run above passed.
- `npx --yes supabase migration new mission_engine_boundary`: created the local migration after the initial sandbox download was denied and an elevated retry was approved.
- `docker info`: unavailable (no running Docker engine). Supabase project inventory: empty.
- Selected changed TypeScript files were formatted with Prettier; repository-wide formatting was not run.

Database function and access-control references consulted: [Supabase database functions](https://supabase.com/docs/guides/database/functions), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security). The changelog Markdown endpoint could not be fetched by the browser tool.
