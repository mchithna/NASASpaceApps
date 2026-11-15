# Foundation gate review — NOT READY

Reviewed 2026-11-15 for Phase 4B Step 7. **No foundation freeze or chapter-development
handover is approved.** This is a blocked gate review and prioritized correction
plan, not a completed developer handbook or stable-release declaration. Objective 1
requires stopping when release blockers remain; objectives 2–9 are deferred.

## Inspected baseline and evidence

- Checked-out branch: `develop`; HEAD: `a6d5501575bb27bdbaf11d99a3d69ad44e521941`
  (`feat: add Playwright end-to-end testing framework and acceptance testing setup`).
- Read `AGENTS.md`, `PROJECT_CONTEXT.md`, `docs/PARALLEL_DEVELOPMENT.md`,
  `docs/PHASE4B_STEP4.md`, `docs/PHASE4B_SECURITY_AUDIT.md`,
  `docs/PHASE4B_ACCEPTANCE_REPORT.md`, builder handovers, all `src/contracts/`
  definitions, mission types/registry/package exports/chapter loader, engine scene,
  activity and export contracts, and checkpoint/navigation validation entry points.
- `docs/PHASE4B_INTEGRATION_PLAN.md` and a dedicated merge log were not found.
  Git history supplies limited merge evidence: `cf141dc` (player system), `8b9405b`
  (platform UI), `d63a3db` (mission engine), followed by integration `4037d1a`,
  security `d63dcd5`, and acceptance `a6d5501`. Commit subjects do not prove testing
  or deployment. Recover/reconstruct the missing integration records before handover.
- Initial working tree: existing modification to `PROJECT_CONTEXT.md` and three
  untracked Step 4/5/6 reports. These were preserved. The reviewed commit alone does
  not contain all evidence currently in the working tree.

## Gate decision and correction order

| Priority / owner | Open gate and evidence | Required closure evidence |
| --- | --- | --- |
| P0 — integration owner | Hosted security is NOT VERIFIED. Security audit S09: deployed migrations, RLS, grants, RPCs and JWT handling are unconfirmed. Prior connector inventories were empty, including after NOVA was supplied. | Identify an accessible, explicitly isolated test project; verify its reference/environment before writes. Read deployed schema/policies/grants and migration history, then test cross-user read/update/delete denial, signed-out/anonymous denial and invalid/expired JWTs. Record sanitized results. Never infer deployment from local SQL. |
| P0 — backend + QA | Atomic completion and independent-connection reward contention remain unverified live. Embedded PGlite and client callback tests cannot establish hosted concurrency behavior. | On the approved test target, run simultaneous duplicate milestone and ending requests through independent connections; verify unique events, fixed 20/40/25/15 awards, total XP equal to event sum, one achievement/discovery, rollback on failure, and retry after lost responses. Follow the security audit's instructions; no production fixtures or resets. |
| P0 — QA + integration owner | Step 6 proves the synthetic tab-local fixture journey only. Registered persistence, refresh/resume, real network interruption and session isolation are not accepted live. | Complete the same journey through real services on the isolated target, with a separately authorized test-only sample publication/adapter that cannot reach production. Verify reload, API failure/retry, dashboard/profile/journal updates, replay and user changes. Do not insert training into the five public cards or real-user reward totals. |
| P1 — QA | Final unit regression was interrupted twice after its RUN banner. The earlier 208-pass result predates final notice/test-config changes. | Obtain a completed full final-tree run, investigate hangs if repeated, and record exit status plus intentional hosted skips separately. Rerun all required checks on the eventual exact candidate. |
| P1 — integration owner | Requested integration plan/merge log are absent; reviewed reports are untracked. Contract handbook, package-wide asset/source validation and mission-directory-only extension proof are not complete. | Recover review history, reconcile source versus deployed configuration, then resume Step 7 to produce the handbook, validator, reversible fixture proof and reviewed evidence inventory. Do not use old builder examples as a frozen contract. |

The activity trust limitation remains explicit: reading/activity completion is a
client assertion. The backend can enforce identity, published sequence, eligibility,
fixed rewards and uniqueness; it cannot prove learning. Guest tab-local XP is editable
and separate from registered totals. Guest-to-account merging is not implemented.

## Current interfaces — reviewed, not frozen

`MissionId` remains the five-value union in `src/missions/types.ts`; the canonical
registry already imports all five packages. Metadata includes sources and media paths.
All packages currently export metadata only. `src/missions/chapter.ts` loads an
optional `chapter: MissionChapter` with scenes and an activity registry from each
package's own `index.ts`, without router changes.

`src/engine/index.ts` exports the existing scene union, typed activity registration,
player and runtime. Scene IDs are checkpoint IDs; resume state is explicitly
serializable. `NovaServices` is authoritative for persistence; callers pass no XP
amount or explorer identity. Completion must commit legacy reward and achievement
atomically. Backend scene-catalog publication remains integration-owned and is needed
for trusted registered rewards; a client chapter export alone is insufficient.
No interface changes or breaking changes were made during this gate review.

## Intended ownership after a passing handover

These are reserved branch names, **not branches created or approved for work here**:

| Branch | Chapter-owned source | Chapter-owned assets |
| --- | --- | --- |
| `mission/surveyor-3` | `src/missions/surveyor-3/` | `public/assets/missions/surveyor-3/` |
| `mission/opportunity` | `src/missions/opportunity/` | `public/assets/missions/opportunity/` |
| `mission/ingenuity` | `src/missions/ingenuity/` | `public/assets/missions/ingenuity/` |
| `mission/insight` | `src/missions/insight/` | `public/assets/missions/insight/` |
| `mission/pioneer-10` | `src/missions/pioneer-10/` | `public/assets/missions/pioneer-10/` |

Engine, router, contracts, registry, providers, shared UI, player services, dependencies
and backend catalog/migrations are integration-owned and require coordinated review.
Future chapter developers must request shared changes instead of editing these files.
The development-only training simulator remains outside the public catalog and real
XP/achievement totals. No mission stories or fixtures were added in this review.

## Validation record and next execution

This turn ran read-only file inventories, contract/report reads, `Test-Path` for the
missing integration plan, and Git status/branch/HEAD/recent-history checks. Sandbox
Git initially rejected ownership; the read-only commands succeeded with elevated
access, without changing Git configuration.

No application checks were rerun: the gate stopped implementation, and changes are
documentation only. Historical Step 6 evidence: lint/typecheck/build passed; 16 local
browser cases passed at mobile/tablet/desktop and production preview; checked dev/mock
markers were absent from the production output. Earlier unit run: 208 passed, two
hosted tests skipped; final reruns incomplete. These are prior results, not new results
for a frozen baseline. Hosted checks remain NOT VERIFIED.

After gate corrections, run on the actual candidate:

```powershell
npm run lint
npm run typecheck
npm test -- --maxWorkers=2 --testTimeout=30000
npm run build
npm run test:e2e
```

Use the dedicated test environment requirements in the security audit for opt-in
hosted checks. The ordinary suite skips them. No keys, resets or deployment commands
are included here. Full environment setup/troubleshooting and the handbook must be
completed when Step 7 resumes.

## Git release gate

Suggested future tag: `foundation-v1.0` (reserved only).
Suggested future handover commit message: `docs: finalize verified NovaExplorer foundation handover`.
Neither is authorized or appropriate for current HEAD. No commit/tag/branch/push was
performed. Do not tag `a6d5501` as a passing foundation.

Safe manual inspection commands for this baseline:

```powershell
git status --short
git branch --show-current
git rev-parse HEAD
git log -8 --oneline
git diff --check
```

Once all gates pass, the integration owner must review the exact candidate diff,
record its full commit ID and obtain explicit commit/tag approval. Generate release
mutation commands against that verified candidate then; none is safe to execute as a
foundation release now.

Next recommended prompt: close the Step 4–6 hosted security/acceptance and final
regression gates on an explicitly designated isolated test project, then resume
Step 7. **Decision: NOT READY.**
