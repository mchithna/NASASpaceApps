# Phase 4B Step 6 — end-to-end acceptance

Date: 2026-11-15. **Freeze/launch decision: BLOCKED pending live backend acceptance.**
The development fixture journey has browser evidence. It is not proof of hosted
Supabase persistence, deployed RLS, JWT validation, or database contention. No
contracts were frozen, no Git tags/commits/merges/pushes were made, and no hosted
migration, user creation, fixture insertion, or data reset was performed.

## Environments and safety

| Environment | Configuration and scope | Result |
| --- | --- | --- |
| Local browser fixture | Playwright 1.65.1, headless installed Google Chrome; 375×900, 768×900, 1280×900; reduced motion enabled. Fresh browser context for every test. | Browser journey exercised; final run summary below. These are viewport tests, not physical-device or Safari/Firefox verification. |
| Local production preview | Built Vite app on 127.0.0.1:4175, fresh context, acceptance query ignored. | Dev routes and mock credentials must be absent; tested separately from fixture mode. |
| Isolated SQL | Existing PGlite migration/service integration suite with synthetic users and Auth functions. No external database URL. | Unit/integration evidence only; no hosted JWT or independent-connection claim. |
| Supabase plugin | Requested NovaExplorer organization; rechecked after the user supplied nickname NOVA. Both organization and project inventories returned empty lists. | **BLOCKED / NOT VERIFIED LIVE.** No visible target to inspect or safely provision with test data. |

The browser suite starts its own dev and preview servers with normal Supabase
environment values blank on the dev server. Development fixture tests abort and
count any `/auth/v1/` or `/rest/v1/` attempt and require a zero count. They never
transmit auth/profile/reward data to Supabase. No production cleanup exists.

The explicit entry is `/?acceptance=training`, available only in development. A
visible banner identifies synthetic rewards and local tab storage. One isolated
mock service instance supplies the existing onboarding, dashboard, profile, journal,
achievement pages, and `/dev/training-simulator`. A versioned sessionStorage fixture
restores on reload. It stores no passwords or tokens. Registered sign-in/signup is
disabled in this fixture. New isolated test guest removes **only** the acceptance
snapshot; it never clears real auth or guest storage.

The training engine retains its existing Surveyor 3 metadata alias internally. That
alias exists only within the isolated adapter's dataset; the public catalog remains
the same five IDs/cards. Synthetic 100 XP and the practice discovery/achievement do
not reach any real account. Normal standalone training still uses a separate
nonpersistent mock. Nothing routes this sample as a sixth public mission.

## Acceptance coverage

| Requested flow | Evidence / checks | Environment | Status |
| --- | --- | --- | --- |
| Fresh `/`, branding, guest entry | NovaExplorer heading, explicit fixture banner, Begin Exploring, fresh guest onboarding. | Browser fixture, all three widths | Passed in matrix. |
| Nickname/avatar, correct initial rank | Acceptance Cadet, Deep Space Pioneer avatar, 0 XP, dashboard and profile state. | Browser fixture | Passed. |
| Select development-only sample | Banner entry opens training player; exactly five Begin Story cards exist before training. | Browser fixture | Passed. No public registry additions. |
| Intro/evidence/timeline/custom activity/discovery | Source link visible, keyboard ordering/check, custom completion, milestone progression. | Browser fixture | Passed. Practice text is labeled as non-NASA content. |
| Navigate away, reload, resume | Leave at ending after discovery, dashboard shows 85 XP, reload keeps profile/85 XP, reopen at ending. | Tab-persisted isolated mock | Passed locally. **Real test-backend resume NOT VERIFIED.** |
| Final status/XP/rank/journal/achievement | 100 XP, Lunar Explorer/Level 2, 1 completed mission in isolated dataset, one journal discovery and one unlocked achievement. | Browser fixture | Passed; no live reward claim. |
| Replay idempotency | Restart completed sequence, traverse scenes, return to dashboard with 100 XP. | Browser fixture; existing SQL/unit tests cover unique reward records | Passed locally. Hosted contention remains open. |
| Sign-out/isolation | Direct profile route after sign-out hides former nickname; a new isolated guest starts at 0 XP. | Browser fixture | Passed. No guest-to-account merge is promised. |
| Invalid routes | Unknown ID, training-simulator as a public ID, and unknown path render Not Found. | Browser fixture; production preview | Passed. |
| Interrupted save/retry | Inject one failure only for the acceptance snapshot write; no saved-success notice; retry and reload restore intro. | Browser fixture | Passed. This is a fixture storage failure, not a hosted-network failure. |
| Slow loading | Delay initial training-module response; shared LoadingState appears before player. | Browser fixture | Passed in initial matrix. |
| Empty/error/shared states | Loading, No notes yet, descriptive error, dialog title focus, forward/back keyboard controls, Escape and focus restoration. | Shared component preview/browser; existing service-error unit tests | Passed locally. |
| Five public mission placeholders | Each official overview and play URL loads a valid planned-content screen; all five fresh cards show Not Started, with Begin Story actions. | Browser fixture, all three widths | Passed. No factual chapter built. |
| Production isolation | Acceptance query does not enable fixture mode; `/dev/training-simulator`, `/dev/components`, public training ID are Not Found; no demo credentials button. | Production preview | Passed. |
| Actual network/API loss, registered persistence | Existing isolated service tests cover unavailable responses, retry, refresh errors, SQL rollback. No configured isolated hosted target was available for browser API interruption. | Unit/embedded SQL only | **PARTIAL / LIVE GATE OPEN.** |

## Device and accessibility evidence

- All three viewport projects exercise the entire fixture journey, public placeholders,
  invalid routes, interrupted save, shared states/dialog keyboard flow, and delayed
  initial loading. The production project checks route and service-mode exclusion.
- Horizontal document overflow is asserted on dashboard, training, profile, and all
  five placeholder screens. Completed dashboard screenshots are captured per width.
- Reduced motion is emulated and checked with `matchMedia`. Intro start and timeline
  interactions use keyboard focus/Enter. Dialog title focus, Tab/Shift+Tab controls,
  Escape, and return to the opener are checked in the browser.
- The final suite samples computed body foreground/background contrast (at least 4.5:1)
  and checks visible enabled button boxes are at least 24×24 CSS pixels at the sampled
  screens. This is not a comprehensive contrast audit or WCAG certification. Visible
  labels, source links, readable wrapping, and mobile/desktop screenshots were reviewed.
- Training has text narration and an explicitly missing-image state, with source
  attribution. There is no audio/video in the sample, so captions/transcripts are N/A;
  no claim is made about future chapter media.
- Physical devices, alternate browser engines, screen readers, and a full color/state
  matrix remain outside the verified scope.

## Failures found and targeted fixes

| Finding | Change / disposition |
| --- | --- |
| Standalone preview could not prove platform totals or survive reload. | Added an explicit dev-only acceptance adapter with fixture hydration and shared page/player services. Normal production provider selection remains real and unchanged. |
| Initial lazy-route hydration displayed a blank interval and React Router warning. | Added existing LoadingState fallbacks to the two development lazy routes; verified with a delayed training module. |
| Generic mock notices incorrectly said the acceptance fixture reset on every refresh. | Added a dev-only UI context flag and accurate local-fixture notices on auth/onboarding/dashboard/profile. No service contract or visual redesign. |
| Installed Playwright required a different managed Chromium revision than the cached binary. | Initial launch failed before any page opened. Installed Chrome successfully ran the browser tests; config now detects that Windows installation, with an explicit channel override available. |
| Initial dialog assertion assumed an incorrect Shift+Tab destination. | Corrected the test to assert forward navigation from Close to Done and backward navigation to Close, then Escape/focus restoration. The shared Dialog implementation was not changed. |
| Sandbox browser cases completed but test runner stalled during Windows subprocess teardown. | The intermediate run's 16 cases reported passes but its runner was interrupted; final execution outside the sandbox is recorded separately below. Do not treat the interrupted command as exit-code success. |

No release-blocking product defect remains demonstrated in the exercised local
fixture flow. Missing live verification is still a release/freeze blocker.

## Commands and artifacts

```powershell
npm run lint
npm run typecheck
npm test -- --maxWorkers=2 --testTimeout=30000
npm run build
npm run test:e2e
```

The E2E suite requires a current build for its production preview. On Windows it
uses installed Chrome when available. Otherwise install the matching managed browser
with `npx playwright install chromium`; `PLAYWRIGHT_CHANNEL` can explicitly select a
supported channel. No browser download was needed for the successful Chrome cases.

Artifacts are ignored by Git:

- `playwright-report/index.html`: browser case results and failure traces.
- `test-results/*/completed-dashboard.png`: one full-page dashboard capture per viewport.
- `test-results/*/trace.zip` and error contexts: retained only for failed cases.

These contain only the isolated synthetic fixture, not real credentials or user data.
The production output was scanned for training-route, acceptance-storage,
fixture-credential, and Playwright/PGlite markers; no checked markers were found.

### Recorded command results

| Command | Actual result |
| --- | --- |
| `npm run lint` | Passed, exit 0. |
| `npm run typecheck` | Passed, exit 0; includes Playwright config/tests through `tsconfig.e2e.json`. |
| `npm test -- --maxWorkers=2 --testTimeout=30000` | Earlier completed run: **208 passed, 2 hosted checks skipped**, exit 0. After final fixture-notice/test-config changes, both sandbox and elevated regression reruns stalled after the Vitest RUN banner without case results and were interrupted. Those final reruns are **not passes**; repeat this check before freeze. Final source lint/typecheck/build and all 16 browser cases passed. |
| `npm run build` | Passed, exit 0; 2,194 modules, 479.83 kB main JS. Existing static/dynamic mission import warnings remain; no build failure. |
| `npm run test:e2e` (elevated Windows process access) | **16 passed in 5.0 minutes, exit 0.** Includes 15 cases across three viewports and one production case. All fixture cases asserted zero Supabase API attempts. |
| `rg -n 'acceptance.training\|acceptance.enabled\|training-simulator\|Playwright\|PGlite\|demo@nova\|demo123' dist` | No matches, exit 1 (expected for an empty search result). |

The earlier sandbox matrix printed 16 passing cases but was interrupted during
Windows subprocess teardown. The final elevated run above completed normally and
supersedes that incomplete command result. Initial managed-browser launch and dialog
assertion failures are documented above, rather than counted as successful runs.

## Files changed

- `docs/PHASE4B_ACCEPTANCE_REPORT.md`, `AGENTS.md`, `PROJECT_CONTEXT.md` — evidence/status.
- `package.json`, `package-lock.json` — test-only `@playwright/test` 1.65.1 and script;
  unrelated npm lockfile metadata churn removed.
- `playwright.config.ts`, `e2e/acceptance.spec.ts`, `e2e/production.spec.ts`,
  `tsconfig.e2e.json`, `tsconfig.json`, `.gitignore` — repeatable browser checks and artifacts.
- `src/engine/training/acceptanceServices.ts`, `TrainingSimulatorPreview.tsx`,
  `src/mocks/createMockServices.ts` — explicit isolated fixture hydration/resume.
- `src/app/providers/AppProviders.tsx`, `src/app/router.tsx` — DEV-only entry/banner,
  test services, and initial lazy-route loading fallbacks.
- `src/pages/context/PlatformServicesContext.tsx`, `platformServicesContextValue.ts`,
  `src/pages/AuthPage.tsx`, `OnboardingPage.tsx`, `DashboardPage.tsx`, `ProfilePage.tsx`
  — distinguish the acceptance fixture's local persistence from ordinary mock mode.

No canonical mission package, shared mission/service contract, database migration,
runtime dependency, or factual story content was changed in this step. Earlier
working-tree changes and handover reports were preserved.

## Blockers and next recommended prompt

1. Supabase connector visibility: inventories remain empty even after NOVA was supplied.
   Reconnect the plugin to the correct account/organization and identify a **separate
   isolated test project**. An organization nickname alone is not a database target.
2. Confirm deployed migrations/grants/RLS before any live journey. The Step 4/5 source
   files and embedded tests do not establish hosted deployment.
3. On that approved test project, run registered test-account onboarding, sample
   persistence/reload, real API interruption/retry, cross-user isolation, and independent
   concurrent reward requests. Do not install sample catalog rows in production.
4. Record live results and resolve any failures before Step 7. **No freeze or tag is
   authorized by this report.**
5. Obtain a completed unit/integration regression on the final tree; the last
   redundant reruns stalled before reporting any cases. The earlier 208-test result
   does not replace this open final-regression check.

Recommended next prompt: finish the blocked live portion of Phase 4B Step 6 using the
accessible, explicitly designated test Supabase project; then reassess freeze readiness.
