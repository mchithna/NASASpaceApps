# Surveyor 3 chapter implementation

Date: 2026-11-15. Branch: `feature/ai`.

## Delivered

The existing Start/Continue/Replay route now loads the authored seven-scene
Surveyor 3 package. It includes equipment inspection, the shared event-order
puzzle, a labeled SVG sampler simulation with an interpretation question, and
Apollo 12 evidence cards. Wrong answers remain retryable; failed saves do not
advance the player. Checkpoint resume, sourced journal unlock, Lunar Archaeologist,
fixed 20/40/25/15 milestone rewards, and replay idempotency use existing services.

The user authorized coordinated engine and database changes, archiving legacy
checkpoints, and a one-line AchievementsPage fix to use the catalog's badge title.
The router, providers, global styles, root packages, engine service interfaces,
mission IDs, and other developers' page designs were preserved.

The package README documents the NASA sources and original photograph credit.
No AI-generated historical facts, measured simulation values, or generated NASA
art were added. No other chapter or AI companion feature was implemented.

## Files

- `src/missions/surveyor-3/`: chapter export, authored scene definitions, four
  activity components, component/SQL tests, metadata and README.
- `public/assets/missions/surveyor-3/apollo-12-visit.jpg`: original NASA photograph.
- Engine: `scenes.ts`, `activityRegistry.ts`, `navigation.ts`, `serviceRuntime.ts`,
  `validateModule.ts`, `MissionPlayer.tsx`, `activities/EventOrderActivity.tsx`,
  `scenes/DiscoverySceneView.tsx`, `scenes/EndingSceneView.tsx`.
- `src/contracts/rewards.ts`: badge title and sourced discovery metadata.
- `src/features/achievements/rewardsService.ts`, `src/mocks/createMockServices.ts`:
  use sourced discovery copy when the catalog supplies it.
- `src/pages/AchievementsPage.tsx`: render `badge.title` instead of a hardcoded name.
- `src/missions/registry.test.ts`, `src/features/missionBackend.integration.test.ts`:
  updated metadata expectations and isolated legacy SQL fixture setup.
- `e2e/surveyor.spec.ts`: browser journey and shared-state checks.
- Two migrations listed below; `AGENTS.md`, `PROJECT_CONTEXT.md`, package README,
  and this report record the current state.
- Ignored `.env`: renamed the existing Gemini key to `GEMINI_API_KEY_1`; added
  empty `GEMINI_API_KEY_2` and `GEMINI_API_KEY_3` slots. Values were never printed.

No application dependency was added. Supabase CLI used its existing `npx` cache
to generate migration names; no root package or lockfile change was made.

## Hosted publication and recovery

Target: existing NOVA project `ptjvlycaiigigdrcybet`.

| Local migration | Hosted version / name |
| --- | --- |
| `20261115065426_surveyor_3_chapter.sql` | `20261115070351` / `surveyor_3_chapter` |
| `20261115070943_surveyor_3_legacy_checkpoint_archive.sql` | `20261115072227` / `surveyor_3_legacy_checkpoint_archive` |

The first migration publishes seven reviewed scene rows and explicit reward
checkpoints. Legacy manifests without explicit rewards retain first-kind behavior.
Read-only hosted checks confirm the exact scene order/kinds and reward mapping:
introduction → scene 2, activity → scene 4, discovery → scene 6.
The helper is not executable by browser roles; checkpoint execution remains
available to authenticated users and denied to anon. Existing identity checks,
fixed XP, locks and transaction boundaries remain in the outcome RPCs.

Four existing Surveyor records referred to legacy checkpoints. At the user's
explicit instruction, the second migration locks and snapshots those rows into
`mission_progress_archive` before setting their chapter progress to `not_started`.
The archive has RLS and no browser-role privileges. Read-only verification found
four archived rows and four clean starts. Before/after aggregate verification:
5 profiles, 20 profile XP, 1 reward event totaling 20 XP, 0 achievements, 0 journal
entries. Those totals were unchanged; no test user or hosted gameplay reward was
created. The archive snapshot retains each original progress row.

These migrations use connector-assigned hosted versions. As with prior setup,
review the ledger mapping before a future CLI push; no history repair was done.

## Validation

- `npm test -- --maxWorkers=2 --testTimeout=30000`: initial full run reported
  214 passed, 2 failed, 2 skipped. One failure was a new chapter test expecting
  an alert where the shared sequence component uses status feedback; corrected.
  The other is an existing auth-copy assertion in
  `src/pages/phase4bServicesIntegration.test.tsx` expecting
  `Guest Recovery Limitation:` after the prior auth redesign. Auth code was not
  changed in this task; that unrelated failure remains open.
- Focused engine/missions/rewards/guest-resume/backend/route command:
  `npx vitest run src/engine src/missions src/features/guestMissionResume.test.ts
  src/features/missionBackend.integration.test.ts
  src/features/achievements/rewardsService.test.ts
  src/pages/missionEngine.integration.test.tsx --maxWorkers=2 --testTimeout=30000`:
  **88 passed in 15 files**.
- After adding archive recovery: `npx vitest run
  src/missions/surveyor-3/backend.test.ts --maxWorkers=1 --testTimeout=30000`:
  **2 passed**. Tests execute real migrations against embedded PostgreSQL,
  including archive snapshot parity, retained XP/achievement, private archive,
  scene manifest parity, early reward denial, milestone timing and idempotency.
  Earlier fixture attempts were rejected by the existing completion/achievement
  guards; the synthetic legacy seed was corrected before deployment.
- The ten profile/journal/achievement tests passed in the earlier combined run;
  the archive test was subsequently rerun successfully as recorded above.
- `npm run lint`: passed. `npm run build` (including `tsc -b`): passed after the
  final application changes. Earlier test-code type errors were corrected.
- `npx playwright test e2e/surveyor.spec.ts --config=playwright.surveyor.local.ts
  --project=mobile --project=tablet --project=desktop`: **3 passed** at 375, 768
  and 1280 pixels, with reduced motion. The full journey checks incorrect-answer
  recovery, checkpoint refresh, 100 XP, sourced journal entry, named badge and
  replay with unchanged XP. Keyboard Enter exercises sequence reordering.
  Mobile and desktop completion screenshots were visually inspected; no
  horizontal overflow was found. Temporary port configuration was removed
  after the run; the checked-in test uses the normal project configuration.
  Initial attempts
  found occupied default ports, an obsolete home CTA selector, the badge-title
  issue, and the fixed development banner covering mobile onboarding controls.
  The test uses temporary ports 4184/4185, minimizes the banner through its normal
  UI, blocks external resources and API requests, and uses local NASA imagery.
  Font rendering therefore uses available local/fallback fonts in this test.
- A local secret-exclusion scan found one configured Gemini key, two empty slots,
  no `VITE_GEMINI_API_KEY` variable, and no configured Gemini key in `dist`.
- Hosted verification was read-only after each migration. No JWT impersonation,
  hosted reward fixture or registered browser account was created.

## Remaining limits and next step

Hosted JWT/Data API, independent database connection contention and the complete
registered browser journey remain open foundation acceptance gates. The existing
intentional authenticated SECURITY DEFINER warnings, disabled leaked-password
protection and anonymous-policy advisor warning remain documented in
`SUPABASE_DATABASE_SETUP.md`. See the [function exposure advisor](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
and [password protection guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
Performance advisor returned no findings after chapter publication.
It also returned no findings after archive publication.
After archive publication the security advisor also reports the intentional
[RLS without policy informational notice](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)
for the admin-only archive. No browser role has privileges on that table; no
allow policy was added simply to hide this notice.

The Supabase skill's changelog Markdown fetch returned unsupported content type;
the current [database function documentation](https://supabase.com/docs/guides/database/functions)
was consulted. No changelog verification is claimed.

Vite warns about the existing static/dynamic mission package import arrangement
and a bundle over 500 kB. No router/registry refactor was attempted in this step.
Legacy guest checkpoints in an old browser cache remain subject to the existing
validation boundary; a new guest tab starts fresh. No guest progress is merged
into account XP.
Other Playwright suites and hosted registered-account browser acceptance were
not run in this task. The broader application suite is not reported as green.

Production AI remains gated by confirmed audience eligibility. Only one Gemini
key has been supplied locally; two slots are empty. No API requests, key/model
validation, rotation service, streaming text or voice integration were added.

Recommended next step: complete the remaining foundation acceptance on a
designated isolated hosted test environment, and resolve the stale auth-copy test.
No next chapter, foundation freeze, release tag, push or merge is included.
