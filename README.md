# NovaExplorer

NovaExplorer is a gamified educational web application for the NASA Space Apps Challenge 2026. It tells standalone stories about five NASA spacecraft that remain on the Moon, on Mars, or on a path through deep space, and about the science those missions made possible.

The audience is school-age space enthusiasts, approximately ages 10–17. The interface direction is **Cinematic Mission Control + Gamified Space Academy**: dark, readable, and scientifically careful, with a light progression layer for profiles, XP, ranks, achievements, and a Discovery Journal.

## Project Overview

The project answers the challenge **Abandoned But Not Forgotten** — storytelling about NASA's discarded equipment.

Challenge page: <https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/>

The five stories are:

| Mission ID | Spacecraft | Story title |
| --- | --- | --- |
| `surveyor-3` | Surveyor 3 | The Robot They Came Back For |
| `opportunity` | Opportunity | The Explorer That Wouldn't Stop |
| `ingenuity` | Ingenuity | Five Flights Became Seventy-Two |
| `insight` | InSight | The Machine That Listened to Mars |
| `pioneer-10` | Pioneer 10 | The Messenger That Never Came Home |

Players will eventually be able to complete the five stories in any order. Chapter scenes are not written yet. Short introductions and NASA Science links live in each mission package. Story titles are narrative. Measurements and history on screen must come from the cited NASA sources.

The team builds the shared platform and a reusable mission engine first. Each of five developers then implements one chapter inside that mission's folder.

## Technology Stack

Installed for Phase 1:

| Concern | Choice |
| --- | --- |
| UI | React 19 with TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4, with design tokens in `src/styles/index.css` |
| Routing | React Router |
| Icons | Lucide React |
| Unit and component tests | Vitest, React Testing Library, and jsdom |
| Lint and format | ESLint and Prettier |

Planned for later phases, and not installed yet: Supabase (authentication and saved progress) and Playwright (end-to-end tests).

## Local Setup

Supported Node.js versions are 20.19+ and 22.12+.

```bash
git clone https://github.com/mchithna/NASASpaceApps.git
cd NASASpaceApps
npm ci
npm run dev
```

The dev server prints a local URL, usually `http://127.0.0.1:5173/`.

Other checks:

```bash
npm run build
npm run lint
npm run typecheck
npm run test -- --run
```

`npm run build` typechecks the project and writes the production bundle to `dist/`. `npm run format` rewrites files with Prettier.

Copy `.env.example` to `.env.local` when Supabase configuration is added. The app does not read those values yet. Do not commit `.env`, `.env.local`, or a service-role key.

While `npm run dev` is running, `/dev/components` shows the design-system preview. That route is omitted from production builds.

## Folder Architecture

```text
src/
  app/          shell, router, and providers
  components/   ui/ design system and layout/ shared chrome
  pages/        one screen per route
  features/     reserved for auth, profiles, progress, and achievements
  engine/       reserved for the mission player
  missions/     one package per mission, plus types.ts and registry.ts
  lib/          small shared helpers, such as class-name joining
  styles/       global CSS and design tokens
  hooks/        shared React hooks
  tests/        Vitest setup. Test files live next to the code they cover.
public/
  assets/       shared media and public/assets/missions/<mission-id>/
```

`src/features/` and `src/engine/` are empty on purpose. Do not put chapter scenes in them.

A mission package is `src/missions/<mission-id>/` with `index.ts`, `mission.ts`, and a README. `src/missions/registry.ts` imports the five packages. Change metadata in the package, not in a second list.

## Current Project Status

Phase 1 is complete: the application shell, design system, mission registry, placeholder routes, and foundation tests are in place.

These are future phases, and they are not implemented:

- Authentication and explorer profiles
- Saved progress
- Actual mission gameplay and the mission engine
- XP, ranks, achievements, and the Discovery Journal
- Playwright end-to-end tests

Placeholder pages are labeled as placeholders. They are not the final academy or chapter screens.

## Coding Conventions

- Components use `PascalCase` filenames and function names, such as `Button.tsx`. Hooks start with `use`. Helpers and variables use `camelCase`.
- Mission ids, route segments, and asset filenames use lowercase kebab-case.
- One React component owns one job. Shared visuals come from `src/components/ui/`. Do not invent a second color system.
- Public props and mission data have explicit TypeScript types. Do not use `any`.
- Import local modules with the `@/` alias and an explicit `.ts` or `.tsx` extension, for example `@/components/ui/Button.tsx`.
- Reuse `Button`, `Card`, `Badge`, `ProgressBar`, `Dialog`, `PageHeader`, `LoadingState`, `EmptyState`, `ErrorState`, and `SectionContainer` before adding a new control.
- Bright fills use `text-on-bright`. Focus styles use the shared `focusRing` classes.
- The mission ids are fixed: `surveyor-3`, `opportunity`, `ingenuity`, `insight`, and `pioneer-10`. Do not add or rename one without team approval.
- Covers live at `public/assets/missions/<mission-id>/cover.svg`. Later files in that folder use lowercase kebab-case names, such as `surface-view.jpg`. The current covers are generated placeholders, not NASA photographs. Keep credits in `mission.ts`. Do not add NASA logos, flags, or mission insignia.
- Prefer semantic HTML, visible focus, and `motion-safe` utilities so reduced-motion preferences are respected.
- Do not invent NASA measurements, quotations, or dates. Cite the NASA source beside factual copy.

## Team Collaboration

Use these branch names. This repository does not create them automatically.

| Branch | Use |
| --- | --- |
| `main` | Stable code that passes lint, typecheck, tests, and the production build |
| `develop` | Integration branch for the shared platform |
| `feature/*` | Shared platform work, such as `feature/explorer-profile` |
| `mission/*` | One future chapter, such as `mission/surveyor-3` |

During chapter work, a developer stays inside `src/missions/<mission-id>/` and `public/assets/missions/<mission-id>/`. Shared files change only when the team agrees the engine contract needs a fix, and that fix must keep all five chapters compatible.

Do not commit secrets. `.gitignore` ignores `.env` and `.env.*`, and keeps `.env.example`.

## Project documents

- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — vision, architecture, roadmap, and collaboration plan
- [AGENTS.md](AGENTS.md) — instructions for coding agents
