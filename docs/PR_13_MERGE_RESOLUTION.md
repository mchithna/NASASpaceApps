# PR #13 conflict resolution

Prepared on 2026-11-15 in branch `codex/resolve-pr-13`, in an isolated worktree.
The original `develop` checkout was left clean and unchanged. At preparation time, nothing was
committed or pushed. GitHub will continue to show the original conflicts until
the reviewed merge commit is published to `feature/ai`.

## Inputs and preservation boundaries

- PR: https://github.com/mchithna/NASASpaceApps/pull/13
- PR head: `be336e2427f38c80f51445caf8a5b3aafa50c1ed` (`feature/ai`).
- Base: `fd02ebedff940470bf180b57b93e6b97bfa6252b` (`develop`).
- Both remote tips were rechecked after validation and remained unchanged.
- The merge was prepared with `git merge --no-commit --no-ff origin/develop`.
- All 35 protected home paths match `develop`: landing components, landing-page
  source, common landing assets, global styles, public layout, entry point and
  HTML document. The 3D Mars, starfield and landing navigation were retained.
- Both authored chapter packages match the PR head exactly. Their interactions,
  NASA media, milestones, replay and checkpoint behavior were not rewritten.
- No dependency, environment, hosted database or Git configuration changes.

## The 16 conflicted files

| File or group | Resolution |
| --- | --- |
| `src/components/layout/AppLayout.tsx`, `MissionLayout.tsx`, `PublicLayout.tsx` | Preserve develop's navigation, backgrounds, footer and route-focus behavior. PublicLayout matches develop exactly, including its home branch. The retained Navbar already supports account/guest sign-out. |
| `src/components/layout/MissionFacts.tsx` | Preserve the PR's availability-aware chapter copy, credited artwork and NASA sources; correct the broken title separator. |
| `src/components/ui/Card.tsx` | Preserve develop's glass-card styling and the PR's `nova-card` styling hook. |
| `src/pages/DashboardPage.tsx`, `ProfilePage.tsx`, `JournalPage.tsx`, `AchievementsPage.tsx` | Preserve develop's modular page designs and their existing service hooks, metrics, editing, search/filter, journal sources, achievement and empty/error behavior. Incoming chapter metadata and reward catalog remain connected. |
| `src/pages/MissionOverviewPage.tsx`, `MissionPlayerPage.tsx` | Preserve develop's dossier/player presentation modules around the incoming package loader and real runtime boundary. Loading, planned, error, retry, account-change recovery and ready states remain. |
| `src/pages/OnboardingPage.tsx` | Preserve develop's stepper, callsign/avatar controls, preview and submit behavior. Remove its unused `currentStep` declaration so checking succeeds. |
| `src/pages/components/MissionControlHero.tsx`, `StatCard.tsx` | Preserve develop's presentation and the existing public props and rank/XP data behavior. |
| `src/pages/components/MissionDashboardCard.tsx` | Preserve the PR's credited-media implementation and existing state-dependent mission actions. The modular dashboard's SpacecraftCard remains intact. |
| `src/pages/components/PageShell.tsx` | Preserve develop's default page header and loading/error behavior; retain the PR's optional `visual`/PageHero contract for callers using it. |

## Integration corrections

- `MissionDossier.tsx`: available chapters show **Ready to explore**, while
  unbuilt chapters retain their preparation notice. Actual chapter covers no
  longer have placeholder-only alternative text. Existing dossier art, sources,
  progress actions and layout remain.
- `AchievementCard.tsx`: display the catalog honor name alongside the existing
  mission/story heading. This preserves **Martian Trailblazer** and **Lunar
  Archaeologist** in the retained achievement-card design.
- `Button.test.tsx`: expect develop's existing lime/glass variant classes. Button
  implementation was not changed.
- `routes.test.tsx`: verify Opportunity's real availability, cover and play link;
  retain preparation-state coverage with the still-unbuilt Pioneer 10 chapter.
- `e2e/platform-style.spec.ts`: use the retained modular screen/navigation
  controls and reduced-motion behavior instead of obsolete PR-only CSS selectors.
- This document records the review and actual validation.

## Validation

| Check | Actual result |
| --- | --- |
| `npm run typecheck` | Passed after removing the unused onboarding declaration. |
| `npm run lint` | Passed. |
| `npm run build` | Passed. Bundle-size and ineffective dynamic-import warnings remain. |
| `npm test -- --maxWorkers=2` | Initial full run: 218 passed, 5 failed, 2 skipped across 41 files. Failures were the missing catalog achievement heading, the stale Opportunity placeholder expectation and three stale button-color expectations. All were corrected. |
| `npx vitest run src/app/routes.test.tsx src/components/ui/Button.test.tsx src/pages/phase4bServicesIntegration.test.tsx --maxWorkers=1` | All three previously failing files passed: 22 tests, including one added preparation-state test. |
| `npx vitest run src/pages/ProfileJournalAchievements.test.tsx src/pages/platformPresentation.test.tsx --maxWorkers=1` | 20 tests passed, checking retained screen behavior and shared presentation after the fixes. |
| `npx playwright test e2e/platform-style.spec.ts e2e/landing.spec.ts --project=mobile --project=desktop` | 4 passed at 375px and 1280px: unchanged landing navigation/assets/keyboard/fallback and academy profile/journal/achievement/mission/auth flows. |
| `npx playwright test --config src/missions/opportunity/playwright.config.ts` | Final rerun: 2 passed at 375px and 1280px. All seven scenes, keyboard controls, incorrect-answer retries, refresh/resume, 100 XP, journal, Martian Trailblazer and replay were exercised. |
| Home preservation / mission-package comparison | Passed: home paths equal develop; both chapter packages equal the PR head. |
| Conflict scan / merge index | No conflict markers; no unmerged index entries. |

The complete suite was not rerun after the targeted corrections; the failed files
and the related presentation/profile/journal/achievement tests were rerun instead.
The two opt-in live tests remain skipped. Browser acceptance uses the existing
isolated training fixture, not a live registered account. No hosted acceptance
gate or production-readiness claim is made.

Mobile dashboard and desktop profile captures were visually inspected, together
with the chapter flow. Test screenshots remain under ignored `test-results/`.
The staged whitespace check reports only two existing Markdown hard-line-break
spaces in develop's `STAGE3_HANDOVER.md`; that document was preserved unchanged.

## Original publication handoff

The resolution is staged and reviewable, with no commit or push. The repository's
AGENTS.md requires explicit instruction before committing or pushing. After that
approval, publish a normal merge commit to the existing `feature/ai` PR branch;
no force push or merge of the PR into develop is needed for conflict resolution.

## Authorized merge validation

The user subsequently authorized merging PR #13 into develop and requested that
codex/resolve-pr-13 be left for manual deletion.

Final checks before publication on 2026-11-15:

- npm run lint: passed.
- npm run build: passed, including TypeScript. Existing bundle-size and
  ineffective dynamic-import warnings remain.
- npm test -- --maxWorkers=2: 223 passed, 2 skipped, 1 failed. The sole failure
  was the incorrect-credentials auth test exceeding its default 5000 ms limit.
- npx vitest run src/pages/AuthOnboarding.test.tsx --maxWorkers=1 --testTimeout=30000:
  all 10 tests passed. No test or application code was changed for this rerun.
- Browser tests were not rerun in this publication turn; the earlier verified
  resolution browser results remain recorded above.
- Both remote branch tips still matched the reviewed resolution inputs.

Publication uses a normal merge commit on feature/ai followed by the GitHub PR
merge into develop. No force push, branch deletion, dependency addition or hosted
database modification is part of this operation.