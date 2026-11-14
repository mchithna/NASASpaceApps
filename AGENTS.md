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

Documentation is in place: `README.md`, `PROJECT_CONTEXT.md`, and this file.

Phase 1, Steps 1, 2, and 3 are complete. The repository root is a Vite + React + TypeScript application with the package name `novaexplorer`. Tailwind CSS v4, React Router, ESLint, Prettier, and strict TypeScript checking are configured. Routing is centralized in `src/app/router.tsx`. Placeholder pages use `PublicLayout`, `AppLayout`, and `MissionLayout`. Design tokens live in `src/styles/index.css`. Shared components live in `src/components/ui/`. The component preview at `/dev/components` is registered only in development.

Authentication, Supabase, explorer profiles, XP, mission chapters, the mission engine, Vitest, React Testing Library, and Playwright are not implemented. Reserved folders under `src/features/`, `src/engine/`, and `src/missions/` are empty.

The next implementation task, when a prompt requests it, is the planned test toolchain: Vitest, React Testing Library, and Playwright.

Update this status when a requested step is finished. Do not mark incomplete work as completed.
