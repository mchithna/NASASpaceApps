# NovaExplorer

NovaExplorer is a gamified educational web application for the NASA Space Apps Challenge 2026. It will tell standalone stories about five NASA spacecraft that remain on the Moon, on Mars, or on a path through deep space, and about the science those missions made possible.

Players will create explorer profiles, complete mission activities, earn XP, unlock achievements, keep a Discovery Journal, and progress through explorer ranks. The interface direction is **Cinematic Mission Control + Gamified Space Academy**, for school-age space enthusiasts approximately ages 10–17.

## Challenge

**Abandoned But Not Forgotten** — storytelling about NASA's discarded equipment.

Challenge page: <https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/>

## Missions

Surveyor 3, Opportunity, Ingenuity, InSight, and Pioneer 10. Chapter content is not written yet.

## Planned stack

React, TypeScript, Vite, Tailwind CSS v4, React Router, Supabase, Vitest, React Testing Library, and Playwright.

The team will build and test a shared platform and a reusable mission engine first. Each of five developers will then implement one mission chapter.

## Status

Phase 1, Steps 1 and 2 are complete. The Vite + React + TypeScript application has shared folders, centralized routing, three layouts, and a placeholder page for every route. Product features are not implemented yet.

## Getting started

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` when Supabase configuration is added. Do not commit `.env` or `.env.local`.

Other scripts: `npm run build`, `npm run lint`, `npm run typecheck`, and `npm run format`.

## Project documents

- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — vision, architecture, roadmap, and collaboration plan
- [AGENTS.md](AGENTS.md) — instructions for coding agents
