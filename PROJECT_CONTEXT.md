# NovaExplorer — Project Context

This document is the shared description of NovaExplorer for teammates and coding agents. Read it before implementing a development step.

It records intent, planning, and the state of the application. Proposed details are not permission to build them.

## How to read this document

Two labels are used throughout:

| Label | Meaning |
| --- | --- |
| **Confirmed** | A product or process decision the team has already made. Treat it as fixed unless the team changes it explicitly. |
| **Proposed** | An implementation detail offered so later work has a shared starting point. It is not built, and it may be revised before the step that implements it is requested. |

Open questions are listed where a decision has not been made. Do not fill those gaps during an unrelated step.

## Current state

**Auth presentation:** `/auth` now presents login and registration in a responsive
cinematic layout, using existing design tokens and auth services. It includes
keyboard-operated tabs, password visibility controls, avatar selection, guest
storage explanations, and motion that respects reduced-motion preferences.
The new Mars photograph is NASA Photojournal PIA00003, credited to NASA/JPL/USGS:
[source and media credit](https://science.nasa.gov/photojournal/valles-marineris-hemisphere/).
This presentation update does not change persistence behavior or close the live gates.

**Hosted database setup:** NOVA connector access now works for
`ptjvlycaiigigdrcybet`. Missing engine/security migrations and a policy performance
and constraint-validation migration were applied with existing records preserved.
See `docs/SUPABASE_DATABASE_SETUP.md`. Earlier connector/deployment statements below
are historical; real Auth/API/concurrency/browser gates remain open, so the
foundation is still not frozen.

**Phase 4B Step 7 gate review: NOT READY.** The freeze stopped at the prior-gate
review; hosted security/concurrency/persistence acceptance and final regression
remain open. `docs/FOUNDATION_HANDOVER.md` records the correction order. Contracts
are not frozen and five-way chapter handover remains deferred. Shared code and
contract changes remain integration-owned and require coordinated review.

**Phase 4B Step 6:** local browser acceptance now has a dev-only, tab-persisted isolated
training fixture and Playwright checks at mobile/tablet/desktop widths plus production
route exclusion. Read `docs/PHASE4B_ACCEPTANCE_REPORT.md` for evidence. Live test-backend
persistence remains unverified; the Step 7 gate review confirms freeze readiness is blocked.

**Phase 4B Step 5:** security/recovery hardening and isolated tests are documented in
`docs/PHASE4B_SECURITY_AUDIT.md`. No new chapter or product feature was added. The
security release gate remains open until hosted policies/JWTs, independent database
connections, and browser acceptance are verified on a designated test environment.

**Phase 4B Step 4 update:** Builders A/B/C have been merged, with provider/auth wiring
already in the baseline. The mission player now has a package loader and real service
adapter, with a local trusted checkpoint/reward migration and isolated training route.
No factual chapters were built. Real guest progress supports same-tab refresh through a
versioned cache. Hosted deployment and browser acceptance remain open, so Step 4 is not marked complete. Read
`docs/PHASE4B_STEP4.md` before further integration. The Phase 1.5 descriptions below
are retained as historical planning, not the current implementation inventory.

**Confirmed status:** Phase 1 is complete. Steps 1 through 5 are in place: the Vite + React + TypeScript application, routing, layouts, design system, five-mission registry, Vitest, and React Testing Library.

Phase 1.5 is complete. Shared contracts live in `src/contracts/`. Deterministic mock services live in `src/mocks/` and are not connected to the shell. Ownership and the Git workflow are in `docs/PARALLEL_DEVELOPMENT.md`.

Feature and engine folders are still reserved. They do not contain authentication, Supabase access, saved profiles, production XP, scenes, or activities. Pages are still placeholders. Playwright is not installed.

The next implementation task, when a prompt explicitly requests it, is one of the parallel workstreams: Phase 2 (player systems), Phase 3 (platform UI), or Phase 4A (mission engine). Phase 4B integrates them later. Do not start a workstream the current prompt did not name.

## Confirmed decisions

| Topic | Decision |
| --- | --- |
| Codename | NovaExplorer |
| Repository | `NASASpaceApps` |
| Event | NASA Space Apps Challenge 2026 |
| Challenge | Abandoned But Not Forgotten — storytelling about NASA's discarded equipment |
| Product | A gamified NASA spacecraft storytelling platform |
| Audience | School-age space enthusiasts, approximately ages 10–17 |
| Missions | Surveyor 3, Opportunity, Ingenuity, InSight, Pioneer 10 |
| Progression | Explorer profiles, XP, ranks, achievements, and a Discovery Journal |
| Planned stack | React, TypeScript, Vite, Tailwind CSS v4, React Router, Supabase, Vitest, React Testing Library, Playwright |
| Interface concept | Cinematic Mission Control + Gamified Space Academy |
| Build strategy | Complete and test the shared platform and reusable mission engine first, then assign one independent mission chapter to each of five developers |
| Parallel work | After Phase 1.5, Builders A, B, and C may work on Phases 2, 3, and 4A at the same time. Phase 4B integrates them. See `docs/PARALLEL_DEVELOPMENT.md`. |
| Ranks | Six ranks, derived from XP: Space Cadet (0), Lunar Explorer (100), Planetary Explorer (200), Mission Specialist (300), Deep Space Explorer (400), Legacy Guardian (500) |
| Mission XP | Each mission awards up to 100 XP in four milestones: introduction 20, activity 40, discovery 25, legacy 15 |
| Roadmap | Phases listed in [Roadmap](#roadmap), including the Phase 1.5 split of later work |

## Vision

**Confirmed.** NovaExplorer will be a gamified educational web application. Players explore five standalone stories about NASA spacecraft that finished their missions and remain on the Moon, on Mars, or on a path through deep space. Each story introduces the hardware and the science that hardware made possible.

The experience combines two confirmed moods:

- **Cinematic Mission Control** — a dark, calm, readable environment for moving through a mission story.
- **Gamified Space Academy** — profiles, XP, ranks, achievements, and a Discovery Journal that make progress visible.

The academy frame may use light fictional narration. Spacecraft history, measurements, quotations, and scientific results stay factual, sourced, and separate from that narration. Simulations and hypothetical scenarios will be labeled as simulations.

## Audience

**Confirmed.** School-age space enthusiasts, approximately ages 10–17.

Implications for later design and writing:

- Introduce aerospace ideas in plain language. Assume curiosity, and define technical terms when they first appear.
- Keep reading passages short enough to finish on a phone or a shared classroom computer.
- Make controls obvious, keyboard-accessible, and visually distinct from decoration.
- Keep tone encouraging and specific. Praise progress without talking down to the reader.
- Support both a first visit and a return visit: a player should be able to resume a mission and see what the journal already holds.

## Challenge fit

**Confirmed.** The project answers NASA Space Apps Challenge 2026, challenge **Abandoned But Not Forgotten**: tell school-age space fans the story of hardware NASA has left on the Moon, on Mars, and in deep space, and the science each piece made possible.

Public challenge page (confirm details there before content work and before submission):

<https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/>

**Proposed compliance notes for later phases, not yet done:**

- Use at least one NASA data source from the official resource list on that challenge page. Eligibility rules for global awards require a listed source. Confirm the live list before choosing datasets.
- Check mission facts in NASA publications, including the [NSSDCA Master Catalog](https://nssdc.gsfc.nasa.gov/nmc/), before any fact appears in the interface.
- NASA Space Apps 2026 participant guidance permits AI assistance when it is disclosed. AI-generated images and video need a visible watermark. AI-generated content must not use or modify NASA logos, flags, or mission identifiers. Re-check the official rules before submission.
- Preserve media credits and source links beside any NASA image or dataset the app displays.

## Selected missions

**Confirmed.** The platform will contain these five missions, and no others, unless the team explicitly changes the set. Mission identifiers below are the agreed folder and route keys. Do not rename them without explicit approval.

Content scenes and activities for every mission are **unwritten**. The notes below identify the hardware so the team shares one subject. They are not chapter copy. Dates, measurements, quotations, image choices, and dataset citations belong in the mission package and must come from NASA sources. Short descriptions already stored in each `mission.ts` are introductions, not chapters.

| Mission ID | Mission | Story setting | Identifying role |
| --- | --- | --- | --- |
| `surveyor-3` | Surveyor 3 | Moon | NASA robotic lunar lander. Apollo 12 astronauts later visited the site and returned selected components to Earth. The lander remains on the Moon. Chapter copy must describe both the visit and the hardware that remains, using NASA sources. |
| `opportunity` | Opportunity | Mars | NASA Mars Exploration Rover. The rover remained on Mars after its surface mission ended. |
| `ingenuity` | Ingenuity | Mars | NASA's Mars helicopter, carried with the Perseverance mission. It flew on Mars and remains there after the flight campaign ended. |
| `insight` | InSight | Mars | NASA Mars lander that studied the planet's interior. The lander remains on Mars after the mission ended. |
| `pioneer-10` | Pioneer 10 | Deep space | NASA probe that flew past Jupiter and continued outward. Contact later ended. This is the deep-space story in the set. |

**Confirmed story titles**, stored in each mission package:

| Mission ID | Story title |
| --- | --- |
| `surveyor-3` | The Robot They Came Back For |
| `opportunity` | The Explorer That Wouldn't Stop |
| `ingenuity` | Five Flights Became Seventy-Two |
| `insight` | The Machine That Listened to Mars |
| `pioneer-10` | The Messenger That Never Came Home |

Each chapter is a standalone story. Players may complete the five missions in any order. A shared epilogue or cross-mission conclusion is **not** decided.

## Planned product

**Confirmed capabilities**, all unimplemented:

| Capability | Intent |
| --- | --- |
| Explorer profile | A player identity used to store progress. |
| XP | Points earned by completing mission activities. |
| Ranks | A progression ladder driven by XP. |
| Achievements | Recognized milestones across the academy and the five missions. |
| Discovery Journal | A record of what the player has learned, kept with the profile. |
| Five mission chapters | One interactive story per mission in the table above. |
| Shared mission engine | One player and progress contract that every chapter uses. |
| Main platform interface | The academy shell: navigation, mission selection, profile, journal, and progress. |

**Proposed behavior**, to be specified in the phase that builds it:

- The journal separates sourced NASA findings from fictional academy narration and from the player's own notes.
- Mission activities report completion to the platform. The platform awards XP, updates rank, unlocks achievements, and appends journal entries.
- Activities can include reading beats, questions, and labeled simulations. The activity mix for each mission is an open question for Phase 5.
- Rank names and XP thresholds are confirmed in Phase 1.5. `rankForXp` in `src/contracts/explorer.ts` is the formula. The five story achievement ids match the placeholder ids already stored on each mission. Further academy achievements are not defined yet.

**Open questions:**

- Authentication method (email and password, magic link, or a specific OAuth provider). The service interface accepts email and password inputs so a provider can be chosen in Phase 2.
- Which profile fields are public, private, or optional. The contract stores nickname, avatar id, XP, and rank. It does not store a password or access token.
- Whether guest progress is kept after the explorer signs in. The contract supports a guest session. The mock does not merge guest XP into the registered profile.
- Which official challenge dataset each mission will cite.

## Technology

### Confirmed planned stack

React, TypeScript, Vite, Tailwind CSS v4, and React Router are installed. Lucide React, ESLint, and Prettier were added in Phase 1, Step 1. Vitest was added in Phase 1, Step 4. React Testing Library and jsdom were added in Phase 1, Step 5. Playwright and Supabase are not installed.

| Concern | Choice |
| --- | --- |
| UI | React with TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router |
| Backend | Supabase |
| Unit and component tests | Vitest and React Testing Library |
| End-to-end tests | Playwright |

**Proposed Supabase scope:** Supabase Auth for explorer sign-in, and Supabase PostgreSQL for profiles, XP, ranks, achievements, journal entries, and per-mission progress. Row Level Security is expected when tables are designed in Phase 2. The schema does not exist yet.

Lucide React is used by the shared components for icons such as loading, warnings, and navigation. Placeholder pages do not add their own icons.

Environment variables and Supabase project keys are not created. When they are added, secret keys stay out of the client bundle and out of Git.

## Design system

**Confirmed direction:** Cinematic Mission Control + Gamified Space Academy.

- Dark, cinematic space-exploration surfaces.
- Clean, readable educational typography and spacing.
- The same navigation, type scale, and components across missions.
- Accessible to school-age learners, responsive from phone to desktop.
- Restrained motion. Honor `prefers-reduced-motion`.
- Interactive controls must look and behave differently from decorative art.
- Avoid excessive neon, visual noise, and animation that competes with the story.

**Confirmed tokens** live in `src/styles/index.css` as Tailwind CSS v4 `@theme` values and CSS custom properties. The dark theme is the only theme. There is no theme switch.

| Role | Token | Value |
| --- | --- | --- |
| Background | `--color-background` | `#0B1020` |
| Surface | `--color-surface` | `#151E32` |
| Elevated surface | `--color-elevated` | `#1D2940` |
| Primary accent | `--color-accent` | `#7C6CFF` |
| Science accent | `--color-science` | `#53CBFF` |
| Rewards / XP | `--color-reward` | `#F7C66A` |
| Primary text | `--color-foreground` | `#F4F7FF` |
| Secondary text | `--color-secondary` | `#B8C8DD` |
| Muted text | `--color-muted` | `#8C9BB3` |
| Border | `--color-border` | `#2B3850` |
| Success | `--color-success` | `#4FD1A5` |
| Error | `--color-danger` | `#F87171` |
| Text on bright fills | `--color-on-bright` | `#0B1020` |
| Focus ring | `--color-focus` | `#53CBFF` |

`--color-on-bright` and `--color-focus` reuse the background and science values for a different job. Bright fills (accent, science, reward, success, and error) use dark text because light text on those fills does not meet WCAG 2.2 AA. Do not set small accent-colored text on a surface. The specified border is faint against the background, so cards also use shadow.

Space Grotesk is the heading font. Inter is the font for body text, labels, buttons, and navigation. Both fall back to `ui-sans-serif`, Segoe UI, and `sans-serif`. Spacing, radius, shadow, and the default 150ms transition are theme tokens. Motion uses `motion-safe` utilities so `prefers-reduced-motion` removes the animation.

**Confirmed visual split:**

- Mission-control surfaces use quiet dark panels for story, sources, and activity content.
- Academy progression uses the reward token. The warning badge uses the same gold as a border and icon, with light text on an elevated surface, so warning and reward stay distinct.
- The science accent is for focus rings and science badges. It stays rare so the interface does not glow uniformly.

**Confirmed shared components** in `src/components/ui/`: `Button`, `Card`, `Badge`, `ProgressBar`, `Dialog`, `PageHeader`, `LoadingState`, `EmptyState`, `ErrorState`, and `SectionContainer`. `src/components/layout/` also has `AppHeader`, `SidebarNav`, and `MobileNav`. Import them from their files, for example `@/components/ui/Button.tsx`. Use token utilities such as `bg-surface` and `text-secondary` instead of hardcoded colors.

A development-only preview is at `/dev/components`. The route is registered only when `import.meta.env.DEV` is true, it is not linked from the app navigation, and the production build omits the page. In production that address falls through to the not-found page.

**Still proposed**, and not built: text field, mission card, rank badge, achievement item, and journal entry.

NASA logos, flags, and mission insignia are not a design resource for original or AI-generated art. Unaltered NASA photographs may be used later with credit, subject to NASA media guidance and the challenge rules.

## Architecture

**Confirmed strategy.** Build a shared platform and a reusable mission engine. Test that foundation. Only then assign chapters. After the engine is in place, a developer should be able to implement one mission without modifying shared platform code.

**Confirmed source layout.** Route screens live in `src/pages/`. Shared layout components live in `src/components/layout/`. Shared design-system components live in `src/components/ui/`. Mission metadata lives in `src/missions/<id>/mission.ts`, and `src/missions/registry.ts` imports those five packages. Phase 1.5 added `src/contracts/` and `src/mocks/`. `src/features/` and `src/engine/` are reserved for Builders A and C and are still empty.

```text
src/
  app/            # shell, router, providers
  components/     # shared ui and layout; gamification is reserved
  pages/          # one placeholder screen per route
  contracts/      # shared player, progress, reward, and service types
  mocks/          # unwired in-memory NovaServices for parallel development
  features/       # later auth, profiles, progress, achievements
  engine/         # later mission player
  missions/       # one package per mission id, plus the registry
  lib/            # shared helpers
  hooks/
  styles/
```

**Ownership:**

| Location | Owns | Does not own |
| --- | --- | --- |
| `src/app/` | Application shell, routing, global providers | Mission copy or mission-only activities |
| `src/pages/` | Route screens. Builder B owns the presentation. | Feature logic, chapter content, or Supabase |
| `src/components/` | Shared visual components | Data fetching for a single mission |
| `src/contracts/` | Shared serializable models and service interfaces. Integration owner. | Supabase clients, page layout, or scene rendering |
| `src/mocks/` | In-memory services for Builders B and C and for tests | Production persistence. Not wired into the shell. |
| `src/features/` | Auth, profile, XP, ranks, achievements, journal. Builder A. | Chapter prose and page design |
| `src/engine/` | Loading a mission module, playing beats, reporting completion. Builder C. | Supabase table design |
| `src/missions/<id>/` | That mission's metadata, and later its content, activities, and local components | Edits to the shell, design system, auth, registry list, or another mission |

**Proposed engine contract:**

- A mission module exports a typed definition: `id`, title, summary, beats or activities, and source citations.
- The engine renders the definition and emits outcomes such as a finished activity or a finished milestone. Those outcomes do not include an XP amount.
- Platform features turn those outcomes into XP, rank, achievements, and journal entries.
- Mission code does not talk to Supabase directly.

Phase 1.5 specifies the service and engine-event contracts in `src/contracts/`. Each mission folder still exports metadata from `mission.ts`. It does not contain scenes or activities yet. The engine implementation is Phase 4A. Connecting it to real services is Phase 4B.

## Roadmap

Phases are **confirmed**. Work inside a phase is **not started** unless this table says otherwise. Steps inside a phase are **proposed** sequencing. Implement a step only when a prompt explicitly requests it.

| Phase | Name | Status | Proposed focus |
| --- | --- | --- | --- |
| 1 | Project Setup & Foundation | Complete. The app, routes, design system, mission registry, and foundation tests are in place. Playwright is not part of this phase. | Initialize the app, then add the planned toolchain, shared folders, and a minimal shell only as later prompts request them. |
| 1.5 | Parallel Development Preparation | Complete. Contracts, mock services, rank rules, and ownership docs are in place. Phases 2, 3, and 4A are not started. | Let three builders work against one service boundary. |
| 2 | Player Systems | Not started. Builder A, branch `feature/player-system`. | Supabase auth, guest sessions, profiles, XP, progress, achievements, and journal persistence. Implements the shared service interfaces. |
| 3 | Main Platform UI | Not started. Builder B, branch `feature/platform-ui`. | Landing page, Mission Control, auth and onboarding UI, profile, achievements, journal, and mission overview. Consumes contracts and mocks. |
| 4A | Independent Mission Engine | Not started. Builder C, branch `feature/mission-engine`. | Shared mission player, scenes, activities, and mock checkpoint and reward calls. No Supabase. |
| 4B | Service, UI, and Engine Integration | Not started. Begins after Phases 2, 3, and 4A merge. | Wire real services through the app provider and router. |
| 5 | Five Independent Mission Chapters | Not started | One developer per mission, working only inside that mission folder. |
| 6 | Integration, Testing & Polish | Not started | Assemble the five chapters, full-journey tests, accessibility pass, scientific review, and submission polish. |

### Phase 1, Step 1

**Complete.** The React + TypeScript application is initialized in the repository root.

The initialization prompt included Tailwind CSS v4, React Router, Lucide React, ESLint, Prettier, strict TypeScript, a placeholder home screen, and Supabase environment placeholders. Those items are in place. The application does not connect to Supabase.

Not part of this step: authentication, profiles, XP, achievements, missions, Vitest, React Testing Library, Playwright, shared feature folders, design tokens, and the application shell.

### Phase 1, Step 2

**Complete.** The application has a scalable folder structure and working routes.

Included in this step:

- Central React Router configuration for the public pages, explorer pages, mission pages, and the not-found page
- `PublicLayout`, `AppLayout`, and `MissionLayout`
- Placeholder pages for every route
- The `@/` import alias
- Empty reserved folders for features, the mission engine, and the five mission chapters

Not part of this step: authentication, Supabase, explorer data, XP, achievement rules, mission chapters, the mission engine, and the final visual design.

### Phase 1, Step 3

**Complete.** The shared design system and reusable interface components are in place.

Included in this step:

- Tailwind CSS v4 theme tokens and CSS custom properties in `src/styles/index.css`
- Shared components in `src/components/ui/`
- `AppHeader`, `SidebarNav`, and `MobileNav` in `src/components/layout/`
- A development-only component preview at `/dev/components`

Not part of this step: the final landing page, Mission Control dashboard, mission gameplay, authentication, a database, NASA mission content, and theme switching.

Component tests were not part of this step.

### Phase 1, Step 4

**Complete.** The five mission packages and the shared registry are in place.

Included in this step:

- `MissionDefinition` and related types in `src/missions/types.ts`
- One package per mission under `src/missions/<id>/`, with `index.ts`, `mission.ts`, and a README
- `src/missions/registry.ts`, which imports the five packages and looks them up by id
- Placeholder covers in `public/assets/missions/<id>/cover.svg`
- Mission overview and play routes read the registry
- Vitest tests for the registry

Not part of this step: story scenes, activities, gameplay, XP, achievements, authentication, Supabase, and NASA photographs.

A mission developer changes that mission's `mission.ts`. The registry already imports the package, so the developer does not add the mission to a metadata list. The five ids stay fixed.

### Phase 1, Step 5

**Complete.** The foundation was audited, component tests were added, and the developer README was expanded.

Included in this step:

- Vitest runs in jsdom with React Testing Library
- Route, not-found, registry, button, dialog, and shared-component tests
- README sections for setup, architecture, conventions, and branch names
- Small accessibility fixes for dialog hiding, Escape, button state, and source links

Not part of this step: Playwright, authentication, profiles, XP, gameplay, and the mission engine.

### Phase 1.5 — Parallel development preparation

**Complete.** The repository can host three independent workstreams without a second mission id or a second XP formula.

Included in this step:

- Serializable auth, profile, progress, reward, and engine-event contracts in `src/contracts/`
- `NovaServices`, the four async service interfaces
- `rankForXp` and the four milestone amounts, with boundary tests
- Isolated mock services in `src/mocks/`, including a guest explorer, a registered explorer, five progress records, and idempotent rewards
- Ownership, integration boundaries, and manual Git commands in `docs/PARALLEL_DEVELOPMENT.md`

Not part of this step: Supabase, database migrations, final pages, mission gameplay, cinematic animation, chapter copy, and production XP persistence. The mocks are not registered in the app shell.

## Collaboration

**Confirmed.** Five developers. Shared platform work and the mission engine come first and are tested before chapter assignment. Each developer then owns one mission chapter.

**Proposed working agreement:**

1. Phases 1 through 4A are shared-platform work, split across Builders A, B, and C after Phase 1.5. Phase 4B integrates the services, UI, and engine. Changes to the shell, design system, contracts, auth, profiles, and engine are reviewed before anyone starts a chapter.
2. Chapter work starts only after the engine contract is stable enough to add a mission without editing shared code.
3. Each developer owns one directory under `src/missions/`. Assignments are not made yet.
4. During Phase 5, shared files stay unchanged except for a coordinated fix to the engine contract. The same fix must keep all five chapters compatible.
5. A developer does not rewrite another developer's mission or unrelated shared files.
6. Phase 6 is joint integration: wire the five modules into the engine, run the test suite, and polish the academy.

| Mission ID | Chapter | Owner |
| --- | --- | --- |
| `surveyor-3` | Surveyor 3 | Unassigned |
| `opportunity` | Opportunity | Unassigned |
| `ingenuity` | Ingenuity | Unassigned |
| `insight` | InSight | Unassigned |
| `pioneer-10` | Pioneer 10 | Unassigned |

**Confirmed parallel workflow.** Three builders may work after the Phase 1.5 baseline. The branches are `develop`, `feature/player-system`, `feature/platform-ui`, and `feature/mission-engine`. They must all start from the same Phase 1.5 commit. Details, protected files, and the commands to create those branches are in `docs/PARALLEL_DEVELOPMENT.md`.

**Proposed Git workflow**, once feature work begins:

- Keep `main` in a working state.
- Use `develop` as the integration branch for Phases 2, 3, and 4A.
- Use a pull request into `develop` for each workstream. Contract changes are separate pull requests reviewed by the integration owner.
- Use a branch named `mission/<mission-id>` for chapter work in Phase 5.
- Do not commit secrets, `.env` files, or Supabase service-role keys.
- Do not force-push, rewrite shared history, or change remotes unless the team explicitly asks.

## Scientific accuracy

**Confirmed rules for every later content step:**

- Use authoritative NASA sources. Prefer the official challenge resource list and the NSSDCA Master Catalog, plus the relevant NASA or JPL mission pages.
- Keep a source citation and media credit with factual claims and NASA media.
- Write fictional academy narration so a reader can tell it apart from mission facts.
- Label simulations, models, and hypothetical values as simulations. Do not present them as NASA measurements.
- Do not invent facts, measurements, quotations, dates, or historical events.
- If a source disagrees with a draft, the NASA source wins, and the draft changes.

## Accessibility

**Confirmed requirement.** The interface must be usable by school-age learners on desktop, tablet, and mobile, including keyboard use and reduced motion.

**Proposed conformance target:** WCAG 2.2 Level AA, to be checked when interface work exists. Expectations from the first interface step onward:

- Semantic headings, landmarks, and control labels.
- Visible focus and a logical tab order.
- Text alternatives for informational images.
- Contrast that remains readable for body text and controls on the dark theme.
- Status messages for loading, empty, and error states.
- Motion that stays off or greatly reduced when the user prefers reduced motion.
- Language aimed at the stated age range.

## Repository contents

| Path | Role |
| --- | --- |
| `README.md` | Short introduction for people |
| `PROJECT_CONTEXT.md` | This document |
| `AGENTS.md` | Persistent instructions for coding agents |
| `docs/PARALLEL_DEVELOPMENT.md` | Builder ownership, service boundaries, and the Git workflow |

The repository also contains the Vite application. `src/app/` holds the shell and router, `src/pages/` holds placeholder screens, and `src/components/layout/` holds the three shared layouts. `src/contracts/` and `src/mocks/` hold the Phase 1.5 boundary. Feature and engine folders are reserved and have no behavior yet.

## Maintaining this document

Update the current-state and roadmap sections when a requested step is actually finished. Leave later phases marked as not started. When a proposed detail becomes a team decision, move it into the confirmed table and remove it from the open questions.
