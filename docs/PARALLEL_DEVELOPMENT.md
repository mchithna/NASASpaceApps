# Parallel development

Phase 1.5 prepares three workstreams that can proceed at the same time. It does not implement them.

Read this document before editing a feature branch. `PROJECT_CONTEXT.md` remains the product description. `AGENTS.md` remains the instruction set for coding agents.

## Workstreams

| Builder | Phase | Branch | Owns |
| --- | --- | --- | --- |
| A | Phase 2 — Player systems | `feature/player-system` | Auth, profiles, progress, achievements, Supabase |
| B | Phase 3 — Main platform UI | `feature/platform-ui` | Pages and presentation |
| C | Phase 4A — Mission engine | `feature/mission-engine` | Shared mission player |

Phase 4B is later. One integration pass wires the real services, the platform UI, and the engine together. Do not start Phase 4B inside one of the three feature branches.

## Dependency direction

```text
Platform UI (Builder B)
        │
        ▼
Shared service interfaces (src/contracts/)
        ▲
Phase 2 implementation (Builder A)

Mission engine (Builder C)
        │
        ▼
Shared service interfaces (src/contracts/)
        ▲
Phase 2 implementation (Builder A)
```

Both the platform UI and the mission engine call `NovaServices`. During parallel work they construct a mock with `createMockServices()` from `src/mocks/`. Builder A implements the same `NovaServices` type. The mission engine does not import Supabase types.

There is no dependency-injection framework. Phase 4B adds a small provider boundary around the existing `AppProviders` component and passes one `NovaServices` object to the UI and the engine. The central router stays in `src/app/router.tsx`. Phase 4B is the only step that chooses the mock or the real services for the running app.

`createMockServices()` is not registered in the app shell. Do not import it from `AppProviders` or the production router on these branches.

## Integration points

These calls are the contract. They are not implemented by Phase 1.5.

| Engine or UI action | Service call |
| --- | --- |
| Read who is signed in | `auth.getSession()` and `auth.subscribe()` |
| Continue as a guest | `auth.startGuestSession()` |
| Sign in, sign up, or sign out | `auth.signIn()`, `auth.signUp()`, `auth.signOut()` |
| Show the profile and rank | `explorer.getProfile()` |
| Edit nickname or avatar | `explorer.saveProfile()` |
| Resume a mission | `progress.getMissionProgress()` or `progress.getProgressOverview()` |
| Save the scene the player is on | `progress.saveCheckpoint()` |
| Finish a predefined milestone | `rewards.grantMilestone({ missionId, milestoneId })` |
| Open a journal discovery | `rewards.unlockDiscovery({ missionId, discoveryId })` |
| Finish a mission | `progress.completeMission({ missionId })` |

`completeMission` is the transactional boundary. A real implementation must commit the completed progress, the `legacy` milestone (15 XP), and that mission's story achievement together. `grantMilestone` uses the same reward key, so a repeated legacy grant does not add XP again.

`grantMilestone` does not move the checkpoint. Saving a checkpoint does not award XP. The UI and the engine make both calls when a scene should do both. They never send an XP amount.

Suggested engine mapping, for Phase 4A to follow:

| Engine event | Later service call |
| --- | --- |
| `ActivityCompletionEvent` | `progress.saveCheckpoint`. Call `grantMilestone` only for the predefined `activity` milestone. |
| `MilestoneCompletionRequest` | `rewards.grantMilestone` |
| `DiscoveryUnlockRequest` | `rewards.unlockDiscovery` |
| `MissionCompletionEvent` | `progress.completeMission({ missionId })` |

The completion event's checkpoint list stays in the engine. The service uses the checkpoints it already stored.

## Builder A — Phase 2, player systems

Primary ownership:

- `src/features/auth/`
- `src/features/profiles/`
- `src/features/progress/`
- `src/features/achievements/`
- `src/lib/supabase.ts`, or the equivalent client module
- `supabase/` migrations

Builder A implements `AuthService`, `ExplorerService`, `ProgressService`, and `RewardsService`. Identity comes from the auth session. Methods do not accept an explorer id or an XP amount.

Builder A does not redesign the landing page, Mission Control dashboard, or mission renderer.

Server-side or database validation required on every write:

- The auth provider checks credentials. Passwords and access tokens are not columns on the profile.
- Nickname and avatar are checked again on save.
- Mission, checkpoint, milestone, achievement, and discovery ids are checked against trusted data.
- Reward keys are unique per explorer. The key format is `<missionId>:<milestoneId>`, for example `surveyor-3:introduction`.
- `completeMission` runs in one transaction.
- Row Level Security is expected when the tables are created. The schema does not exist yet.

The mock keeps a demo password in memory so sign-in can be exercised. That storage is not a pattern for Supabase. Do not copy it into a table.

Guest progress is not merged into a registered profile. Whether a later sign-in keeps guest progress is still an open product decision. Do not invent a merge while implementing the first schema unless the team decides one.

## Builder B — Phase 3, platform UI

Primary ownership:

- `src/pages/`
- Presentation components for the academy shell
- Page-specific hooks and UI composition

Builder B reads `NovaServices` and, until Phase 4B, builds them with `createMockServices()`. Useful personas are `signed-out`, `guest`, `registered`, and `initializing`.

```ts
import { createMockServices } from '@/mocks/index.ts'

const services = createMockServices({ persona: 'registered' })
```

The registered sample is Nova Cadet, 160 XP, rank Lunar Explorer. Surveyor 3 is in progress. Ingenuity is complete. The journal entry is a development placeholder, not a NASA finding.

Builder B does not add an XP formula, an auth backend, or a database schema. Rank display uses `profile.rank` from the service. The pure helper `rankForXp` is only for tests and for the service implementation.

## Builder C — Phase 4A, mission engine

Primary ownership:

- `src/engine/`
- Engine-specific components
- Engine tests
- A mock training mission kept in an engine-owned development location

Builder C uses `MissionDefinition` and `MissionId` from `src/missions/types.ts`, plus the progress and reward contracts. A training mission is not a sixth entry in the registry and is not a new `MissionId`.

Builder C does not edit the five mission packages and does not import Supabase.

Checkpoint and discovery ids use `isStableKey`: lowercase kebab-case, 1 to 64 characters. Examples: `opening`, `field-work`. The mock rejects empty strings, uppercase, and path-like values.

## Protected files

These belong to the integration owner. A feature branch does not rewrite them.

- `src/contracts/`
- `src/app/router.tsx` and the rest of the central router
- `src/app/providers/`
- `src/missions/types.ts` and `src/missions/registry.ts`
- `src/components/ui/` and `src/styles/index.css`
- `package.json` and `package-lock.json`
- `AGENTS.md`
- `PROJECT_CONTEXT.md`
- This document

A builder who needs a dependency or a contract change writes the request down in the pull request and stops. The request names the type, why the current contract cannot express it, and which workstreams it affects. The integration owner applies the approved change on `develop`, including the mock and the tests. The other branches merge that commit before they depend on it.

## Ranks and milestones

These values are now fixed for implementation. They live in `src/contracts/explorer.ts` and `src/contracts/rewards.ts`.

| XP | Level | Rank |
| --- | --- | --- |
| 0 | 1 | Space Cadet |
| 100 | 2 | Lunar Explorer |
| 200 | 3 | Planetary Explorer |
| 300 | 4 | Mission Specialist |
| 400 | 5 | Deep Space Explorer |
| 500 | 6 | Legacy Guardian |

Each mission can award 100 XP through four milestones:

| Milestone | XP |
| --- | --- |
| introduction | 20 |
| activity | 40 |
| discovery | 25 |
| legacy | 15 |

Five completed missions reach 500 XP, which is Legacy Guardian. XP above 500 stays at that rank. Negative and fractional XP are rejected by `rankForXp`.

Story achievement ids match the placeholder ids already stored on each mission: `surveyor-3-story`, `opportunity-story`, `ingenuity-story`, `insight-story`, and `pioneer-10-story`.

## Git workflow

Inspected when Phase 1.5 was prepared:

- Branch: `main`
- Tracking: `origin/main`
- Phase 1 commit: `942e671`
- `develop` and the three feature branches did not exist yet

Do not create, switch, merge, or push those branches until the Phase 1.5 commit exists and has been reviewed. All three feature branches must start from that same commit.

### Commands to run after review

From the repository root, in PowerShell:

```powershell
git status
git add AGENTS.md PROJECT_CONTEXT.md docs/PARALLEL_DEVELOPMENT.md src/contracts src/mocks
git commit -m "Add shared contracts and mocks for parallel development."
git branch develop
git branch feature/player-system
git branch feature/platform-ui
git branch feature/mission-engine
git branch --list main develop "feature/*"
```

Optional label for the baseline commit:

```powershell
git tag phase-1.5
```

Starting work later, one builder at a time:

```powershell
git checkout feature/player-system
```

Use `feature/platform-ui` or `feature/mission-engine` for the other builders. Do not commit this preparation onto three diverging branches.

### Day to day

1. Start from the Phase 1.5 baseline above.
2. Commit only inside the owning directories, plus tests for that work.
3. Open a pull request into `develop`.
4. Another builder, or the integration owner, reviews it. Contract changes are separate pull requests and land before feature work that needs them.
5. After each merge to `develop`, run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.
6. Update `main` from `develop` only when the integrated result is stable.
7. Do not force-push. Do not commit `.env` files or service-role keys.

`main` stays the stable application. `develop` is the integration branch. Chapter branches named `mission/<mission-id>` still wait until Phase 5.

## Known limits

- The mock is memory inside one `createMockServices()` call. A refresh clears it. Instances do not share state.
- Guest XP is kept only for that guest session. Signing in loads the registered sample and does not add the guest XP to it.
- The mock can unlock a catalog achievement without checking gameplay. Phase 2 must enforce the rule in the database.
- The mock can grant `legacy` from `grantMilestone` as well as from `completeMission`. Production must still commit completion and that reward together.
- Completing a mission does not award the earlier milestones. Those are separate grants.
- Journal text in the mock is marked `placeholder`. Do not present it as a NASA measurement.
- The sample sign-in is `nova.cadet@example.com` / `academy-demo`. It is not a real account.
