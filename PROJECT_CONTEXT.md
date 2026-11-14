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

**Confirmed status:** Phase 1, Steps 1 through 4 are complete. The repository root is a Vite + React + TypeScript application named `novaexplorer`. Routing, three shared layouts, placeholder pages, design tokens, shared UI components, and the five-mission registry are in place. Feature and engine folders exist for later work and do not contain authentication, Supabase access, profiles, XP, or achievement logic. Mission folders contain metadata only. They do not contain scenes, activities, or chapter prose.

The next implementation task, when it is explicitly requested, is the planned test toolchain: Vitest, React Testing Library, and Playwright.

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
| Roadmap | Six phases, listed in [Roadmap](#roadmap) |

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
- Rank names, XP thresholds, and the achievement list are open questions. Do not invent a canon ladder in code comments or placeholder copy unless the active step asks for placeholders and labels them as placeholders.

**Open questions:**

- Authentication method (email and password, magic link, or a specific OAuth provider).
- Which profile fields are public, private, or optional.
- Whether progress is stored only for signed-in explorers, or whether a local guest session exists before sign-in.
- Exact journal entry schema.
- Which official challenge dataset each mission will cite.

## Technology

### Confirmed planned stack

React, TypeScript, Vite, Tailwind CSS v4, and React Router are installed. Lucide React, ESLint, and Prettier were added in Phase 1, Step 1 because that prompt requested them. Vitest was added in Phase 1, Step 4 for registry tests. React Testing Library, Playwright, and Supabase are not installed.

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

**Proposed source layout**, created in Phase 1, Steps 2 through 4. Route screens live in `src/pages/`. Shared layout components live in `src/components/layout/`. Shared design-system components live in `src/components/ui/`. Mission metadata lives in `src/missions/<id>/mission.ts`, and `src/missions/registry.ts` imports those five packages. `src/features/` and `src/engine/` are reserved and currently empty. Do not add authentication, gamification, engine behavior, or chapter scenes until the phase that owns that work is requested.

```text
src/
  app/            # shell, router, providers
  components/     # shared ui and layout; gamification is reserved
  pages/          # one placeholder screen per route
  features/       # later auth, profiles, progress, achievements
  engine/         # later mission player
  missions/       # one package per mission id, plus the registry
  lib/            # shared helpers
  hooks/
  styles/
```

**Proposed boundary:**

| Location | Owns | Does not own |
| --- | --- | --- |
| `src/app/` | Application shell, routing, global providers | Mission copy or mission-only activities |
| `src/pages/` | Route screens | Feature logic, chapter content, or Supabase |
| `src/components/` | Shared visual components | Data fetching for a single mission |
| `src/features/` | Auth, profile, XP, ranks, achievements, journal | Chapter prose |
| `src/engine/` | Loading a mission module, playing beats, reporting completion | Supabase table design |
| `src/missions/<id>/` | That mission's metadata, and later its content, activities, and local components | Edits to the shell, design system, auth, registry list, or another mission |

**Proposed engine contract:**

- A mission module exports a typed definition: `id`, title, summary, beats or activities, and source citations.
- The engine renders the definition and emits outcomes such as "beat completed" or "activity scored."
- Platform features turn those outcomes into XP, rank, achievements, and journal entries.
- Mission code does not talk to Supabase directly.

The contract will be specified in Phase 4. Each mission folder now exports metadata from `mission.ts`. It does not contain scenes or activities yet.

## Roadmap

Phases are **confirmed**. Work inside a phase is **not started** unless this table says otherwise. Steps inside a phase are **proposed** sequencing. Implement a step only when a prompt explicitly requests it.

| Phase | Name | Status | Proposed focus |
| --- | --- | --- | --- |
| 1 | Project Setup & Foundation | Started. Steps 1 through 4 are complete: the app, routes, design system, and mission registry are in place. Vitest covers the registry. React Testing Library and Playwright are not started. | Initialize the app, then add the planned toolchain, shared folders, and a minimal shell only as later prompts request them. |
| 2 | Authentication & Explorer Profiles | Not started | Supabase auth, profile data, and session handling. |
| 3 | Main Platform Interface | Not started | Academy navigation, mission select, profile, journal, and progress screens on the shared design system. |
| 4 | Reusable Mission Engine | Not started | Typed mission contract, player, and progress events. Test the engine with a fixture mission before real chapters. |
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

## Collaboration

**Confirmed.** Five developers. Shared platform work and the mission engine come first and are tested before chapter assignment. Each developer then owns one mission chapter.

**Proposed working agreement:**

1. Phases 1–4 are shared-platform work. Changes to the shell, design system, auth, profiles, and engine are reviewed before anyone starts a chapter.
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

**Proposed Git workflow**, once feature work begins:

- Keep `main` in a working state.
- Use a branch and a pull request for shared-platform work.
- Use a branch named `mission/<mission-id>` for chapter work.
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

The repository also contains the Vite application. `src/app/` holds the shell and router, `src/pages/` holds placeholder screens, and `src/components/layout/` holds the three shared layouts. Feature, engine, and mission folders are reserved and have no behavior yet.

## Maintaining this document

Update the current-state and roadmap sections when a requested step is actually finished. Leave later phases marked as not started. When a proposed detail becomes a team decision, move it into the confirmed table and remove it from the open questions.
