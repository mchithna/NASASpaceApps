# NovaExplorer — Coding Agent Instructions

## Project identity

- Repository: `NASASpaceApps`
- Codename: NovaExplorer
- Event: NASA Space Apps Challenge 2026
- Challenge: Abandoned But Not Forgotten — storytelling about NASA's discarded equipment

## Required reading

Before implementing any change, read `PROJECT_CONTEXT.md`. Use it for audience, missions, planned features, stack, architecture, roadmap, and the difference between confirmed decisions and proposed details.

Also read the files the requested step will touch. Match existing patterns once code exists.

## Scope rule

Implement only the development step the user explicitly requests in the current prompt.

- Do the named step, and stop.
- Do not start the next phase, the next step, or "helpful" follow-on work.
- Do not add dependencies, folders, routes, schema, or UI that the requested step does not require.
- Do not treat a proposed detail in `PROJECT_CONTEXT.md` as permission to build it.
- If the request is ambiguous, follow the narrowest reading that satisfies the prompt, or ask. Do not widen the task.
- Leave unrelated files unchanged.

The current next step is recorded at the bottom of this file. Being "next" does not authorize it. Wait until a prompt asks for that step.

## Coding conventions

Once application code exists:

- Use TypeScript with explicit types for public props, mission definitions, and shared data. Avoid `any`.
- Prefer small React components with a single responsibility. Use semantic HTML before ARIA.
- Put shared behavior in shared modules. Keep mission-specific code inside that mission's directory.
- Use the shared design system for styling. Do not introduce one-off visual languages.
- Handle loading, empty, and error states where the user can encounter them.
- Preserve working behavior when changing existing code.
- Add a dependency only when the requested step requires it. Prefer the planned stack in `PROJECT_CONTEXT.md`.
- Do not over-abstract. A mission engine contract is shared infrastructure. A helper used once can stay local.
- Do not add placeholder features, sample missions, or fake NASA data to demonstrate unfinished phases.

## Architecture boundaries

The application will use a shared platform and a reusable mission engine.

Shared application functionality belongs in common directories such as `src/app/`, `src/components/`, `src/features/`, and `src/engine/`.

Mission-specific content and activities belong in `src/missions/<mission-id>/`.

After the mission engine is finalized, a developer must be able to implement one chapter without modifying shared platform code. Until that engine exists, do not create mission implementation files ahead of the requested step.

The five mission IDs are fixed:

- `surveyor-3`
- `opportunity`
- `ingenuity`
- `insight`
- `pioneer-10`

Do not change these identifiers without explicit approval. Do not add a sixth mission.

Proposed engine rule, to honor once the engine exists: mission modules emit progress outcomes, and platform features persist profiles, XP, ranks, achievements, and journal entries. Mission code does not access Supabase on its own.

## Parallel workstreams

Phase 1.5 added shared contracts in `src/contracts/` and unwired mock services in `src/mocks/`. Ownership, the service boundary, and the Git workflow are in `docs/PARALLEL_DEVELOPMENT.md`.

- Builder A (Phase 2, player systems) owns `src/features/` implementations and future Supabase access. That builder implements the shared service interfaces.
- Builder B (Phase 3, platform UI) owns `src/pages/` and presentation composition. It consumes the contracts and mock adapters.
- Builder C (Phase 4A, mission engine) owns `src/engine/`. It uses the Phase 1 mission metadata and the progress and reward contracts. It does not use Supabase.
- Phase 4B wires the real services, UI, and engine together. It is not part of the three feature branches.

Do not rewrite `src/contracts/`, the mission registry, the central router, global providers, shared UI primitives, design tokens, `package.json`, the lockfile, or these project documents on a feature branch. Ask the integration owner to apply that change.

Do not register `createMockServices()` in `AppProviders` or the production router. Phase 4B chooses the implementation once.

## Accessibility

The audience is school-age learners, approximately ages 10–17. Interface work must be usable with a keyboard, on a phone, and with reduced motion.

- Provide accessible names for controls, including icon-only buttons.
- Keep focus visible and tab order logical.
- Use headings and landmarks that match the visible structure.
- Give informational images alternative text. Mark decorative images so assistive tech can skip them.
- Keep body text and controls readable on the dark theme. Check contrast when introducing or changing colors.
- Respect `prefers-reduced-motion`.
- Write labels, errors, empty states, and instructions in plain language, with technical terms explained.
- Do not rely on color alone to convey status.

The proposed conformance target is WCAG 2.2 Level AA. Apply it to the surfaces the requested step creates or changes.

## Scientific accuracy

- Use authoritative NASA sources. Confirm facts, dates, measurements, and quotations before they appear in the product.
- Preserve source references and media credits.
- Distinguish factual material from fictional academy narration in the writing and, when both appear on screen, in the interface.
- Label simulations and hypothetical scenarios as simulations.
- Never present illustrative simulation values as NASA measurements.
- Never invent NASA facts, measurements, quotations, or historical events.
- Do not create or modify NASA logos, flags, or mission identifiers in generated art.
- When AI-generated images or video are added, include a visible watermark and a disclosure path that submission materials can reuse. Confirm the current Space Apps rules before relying on a specific watermark.

`PROJECT_CONTEXT.md` identifies the five missions. It is not a source of record for numerical claims or quotations.

## Testing expectations

The planned tools are Vitest, React Testing Library, and Playwright, plus TypeScript checking. They are not installed until a step adds them. ESLint is expected once the project defines a lint script.

When the requested step adds or changes code that those tools cover:

- Run the TypeScript check if a typecheck script or `tsc` config exists.
- Run ESLint if a lint script exists.
- Run the unit or component tests that cover the change. Add tests for new behavior that the step introduced when the test runner is already part of the project, or when the step itself asks for tests.
- Run Playwright when the step changes a user journey already covered by end-to-end tests, or when the step asks for that coverage.
- Verify the production build when the step changes build configuration, routing, or the shipped shell.
- Report the commands you ran and their results. If a check failed, say so. If you did not run a check, say that it was not run. Never claim an unrun check passed.

Documentation-only steps do not require the application test suite.

## UI verification

When a step changes a web interface (layout, styling, routing, client state, or rendered data), verify the affected flow in the browser before calling the work complete. Exercise the interaction a learner would use. Check shared states on the other screens that read them, plus empty and error paths the change can affect. If no browser is available, use the closest substitute and say what you could not verify.

## Git safety

- Preserve the existing Git repository and history.
- Do not change Git configuration.
- Do not change remotes.
- Do not commit or push unless the user explicitly instructs you to.
- Do not force-push, hard-reset, or skip hooks unless the user explicitly requests that exact action.
- Do not commit secrets, `.env` files, credentials, or service-role keys. Warn the user if they ask to commit those files.
- Do not modify unrelated files.
- Do not overwrite teammates' work.
- Follow the agreed branch and pull-request workflow when the user asks for a branch or pull request.
- If a commit fails because of a hook, fix the problem and create a new commit. Do not amend a failed commit.

## Agent response format

After completing an implementation or documentation task, provide:

1. Summary of changes.
2. Files created or modified.
3. Dependencies added.
4. Tests and validation results.
5. Issues or limitations.
6. Recommended next step.

The recommended next step is a suggestion only. Do not implement it in the same turn.

## Current development status

InSight now exports an authored seven-scene chapter through its package loader,
with instrument inspection, a seismometer-deployment simulation, seismic signal
investigation, an interior discovery, a qualitative dust model, and a final
timeline. Milestones remain 20/40/25/15 XP. The shared catalog displays
`insight-story` as Planetary Detective and `insight-notes` as Mars Has a Hidden
Structure. Guest mock play, resume, and a no-duplicate replay were verified
locally. Migration `20261115171000_insight_chapter.sql` is local only and has
not been applied to `ptjvlycaiigigdrcybet`, so registered hosted checkpoint
saving is unverified. No player data was reset. See `src/missions/insight/README.md`.
This does not freeze the foundation.

The develop preview failed because the Edge Function `api/chat` imported
`src/ai/nova-system-prompt.ts`. Vercel cannot bundle that outside TypeScript
module into an Edge Function. The same prompt now lives in `api/chat.ts`, and
gateway settings are read from the function environment. The chat request and
streamed response contract is unchanged. No provider key was added.

Pioneer 10 now exports seven sourced scenes through the existing chapter loader,
with spacecraft inspection, a sparse-belt journey, Jupiter instrument science,
plaque decoding, a light-delay communication lab and legacy ordering. Fixed
20/40/25/15 XP, existing `pioneer-10-story` and sourced `pioneer-10-notes` use the
shared services. Trusted catalog migration `20261115143538` is local, not hosted;
registered saves require deployment. See `src/missions/pioneer-10/README.md` for
sources, validation and limits. No home page or other chapter source was changed.

Ingenuity now exports seven sourced scenes through the existing chapter loader,
with aircraft inspection, a qualitative flight lab, autonomous first-flight
simulation, hypothetical scouting, Flight 72 evidence and a legacy timeline.
Fixed 20/40/25/15 XP, the existing `ingenuity-story` achievement and sourced
`ingenuity-notes` use shared services. Minimal catalog integration was authorized;
the trusted catalog migration `20261115134651` is prepared locally, not hosted.
See `src/missions/ingenuity/README.md` for validation and deployment limits.
No home page, auth, routing, reward logic or other chapter source was changed.

The inner-page observatory redesign adds a locally served NASA/JAXA night-sky
photograph, decorative animated stars, glass panels, refreshed page heroes,
mission imagery on achievement cards, consistent actions and a rebuilt footer.
The home page, its components, styles, assets and footer are unchanged. Tablet
navigation now exposes the menu; reduced motion disables the new animations.
This is presentation work only; hosted acceptance gates remain open. See
`docs/OBSERVATORY_REDESIGN.md` for scope, image provenance and validation.

The shared Nova companion is now mounted once through App.tsx, with a visible
launcher, local sourced mission briefings, simple explanations, glossary and app
help. This is explicitly source guide mode, not connected generative AI. Live
text/voice and roadmap capabilities 6–20 remain unimplemented; eligible provider
access for the 10–17 audience is unresolved. The unused browser Gemini key
accessor was removed. See `docs/AI_INTEGRATION.md` for scope and validation.

Opportunity now exports seven authored scenes through the existing chapter loader,
with rover hotspots, water clues, a four-crater expedition, evidence matching,
a qualitative airborne-dust simulation and a final timeline. Milestones remain
20/40/25/15 XP, with sourced `opportunity-notes` and Martian Trailblazer.
The user authorized minimal coordinated ending-interaction, reward-catalog and
trusted manifest changes. Hosted catalog version `20261115083036` is applied to
`ptjvlycaiigigdrcybet`; seven scene rows and restricted catalog privileges were
verified read-only. No player data was reset. See `src/missions/opportunity/README.md`
for sources, validation and limits. Registered hosted browser/JWT/concurrency
acceptance remains open; this does not freeze the foundation. Older statements
that every chapter except Surveyor 3 is unbuilt are historical.

The learner-facing platform now follows the home page's visual language: scoped
dark/lime styling, floating navigation, credited NASA imagery, responsive page
heroes, updated mission cards, profile/setup forms, journal and achievement
presentation, mission dossiers/player, and the not-found screen. Auth retains its
existing space artwork with a matching header. Home page source and gameplay,
identity, service contracts, rewards and persistence behavior are preserved.
See `docs/PLATFORM_VISUAL_REFRESH.md` for files, checks and limitations. This is a
presentation update; the previously open foundation acceptance gates remain open.

Surveyor 3 now exports an authored seven-scene chapter through its package loader,
with equipment inspection, landing sequence, sampler simulation and Apollo evidence.
The user authorized coordinated engine interaction/reward mapping and trusted
manifest changes. The chapter migration is applied to `ptjvlycaiigigdrcybet`;
hosted read-only checks confirm seven scenes and reward checkpoints at scenes 2/4/6.
Four legacy checkpoint rows were archived and their chapter progress restarted
with explicit user approval; earned XP and achievements were preserved.
See `src/missions/surveyor-3/README.md` and `docs/SURVEYOR_3_IMPLEMENTATION.md`
for validation and limitations. Other chapters remain unbuilt. Foundation gates
remain open; this does not freeze shared contracts or establish production readiness.
The ignored Gemini environment has one configured server-only key and two empty
slots. No production AI integration or model/key validation was performed.

The `/auth` login and registration presentation has been redesigned with a responsive
space-themed layout, credited NASA Mars imagery, reduced-motion-aware animations,
keyboard tabs, password visibility controls, and compact avatar selection. Existing
auth services and guest/account progress boundaries are preserved. This UI work
does not close the hosted acceptance gates or freeze the foundation.

Hosted database setup is now applied to `ptjvlycaiigigdrcybet`; connector access
works. See `docs/SUPABASE_DATABASE_SETUP.md` for migration version mapping, live
SQL checks, remaining Auth/advisor warnings and test limitations. This supersedes
earlier empty-connector/deployment statements for this project only. It is not a
foundation freeze; isolated live JWT/API/concurrency/browser acceptance is still open.

Phase 4B Step 7 gate review: **NOT READY; foundation not frozen**. See
`docs/FOUNDATION_HANDOVER.md` for the prioritized correction plan. Hosted security,
concurrent rewards, real persistence acceptance and final regression remain open.
Chapter handover is deferred. Shared code/contracts remain integration-owned and
require coordinated review; no release tag or chapter branch was created.

Phase 4B Step 6 adds an explicitly isolated development acceptance fixture and
Playwright viewport/production checks. See `docs/PHASE4B_ACCEPTANCE_REPORT.md` for
actual results. Live Supabase acceptance remains blocked: the connector exposes no
organizations/projects, including after the NOVA nickname was supplied. Do not freeze
contracts or tag a release until the report's live gates are closed.

Phase 4B Step 5 security hardening is prepared. Read `docs/PHASE4B_SECURITY_AUDIT.md`
for evidence, fixes, and open gates. The security migration is local only; hosted
JWT/RLS verification, independent-connection contention, and browser acceptance
remain unverified. Do not mark the deployment security gate complete from source alone.

Phase 4B Step 4 integration code is prepared. The mission player consumes the provider's
real progress/reward boundary through a validated adapter; package-local chapter exports
are loaded without router changes. The five factual chapters remain unbuilt. The new
trusted checkpoint/reward migration is local, not hosted. Step 4 is not yet accepted:
hosted verification and browser acceptance remain open. Real guest progress now uses
a versioned tab-local cache; mock training remains isolated and resets on refresh.
See `docs/PHASE4B_STEP4.md` for the authoritative integration handover. The older phase
descriptions below record the original Phase 1.5 baseline and are historical.

Documentation is in place: `README.md`, `PROJECT_CONTEXT.md`, `docs/PARALLEL_DEVELOPMENT.md`, and this file.

Phase 1 is complete. The repository root is a Vite + React + TypeScript application with the package name `novaexplorer`. Tailwind CSS v4, React Router, ESLint, Prettier, Vitest, and React Testing Library are configured. Routing is centralized in `src/app/router.tsx`. Placeholder pages use `PublicLayout`, `AppLayout`, and `MissionLayout`. Design tokens live in `src/styles/index.css`. Shared components live in `src/components/ui/`. The component preview at `/dev/components` is registered only in development. Mission metadata lives in `src/missions/<id>/mission.ts`. `src/missions/registry.ts` imports the five packages.

Phase 1.5 is complete. Shared player, progress, reward, and service contracts live in `src/contracts/`. `rankForXp` derives the six confirmed ranks. `src/mocks/` provides isolated, deterministic `NovaServices` for local development and tests. Those mocks are not wired into the application shell. Rank thresholds, the four mission milestones, and parallel ownership are documented in `docs/PARALLEL_DEVELOPMENT.md`.

Authentication, Supabase, explorer-profile persistence, production XP, mission chapters, the mission engine, and Playwright are not implemented. Reserved folders under `src/features/` and `src/engine/` are empty. Pages are still placeholders.

The next implementation task, when a prompt requests it, is one named workstream: Phase 2 (Builder A, player systems), Phase 3 (Builder B, platform UI), or Phase 4A (Builder C, mission engine). Phase 4B waits until those three are ready to integrate. Do not start a workstream the current prompt did not name.

Update this status when a requested step is finished. Do not mark incomplete work as completed.
