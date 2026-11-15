# Inner-page observatory redesign

The requested presentation update covers Mission Control, authentication,
explorer setup/profile, Discovery Journal, achievements, mission dossiers/player
and not-found pages. Home page components, styles, assets and footer are unchanged.

## Presentation

- `src/styles/observatory.css` scopes the night sky, glass surfaces, page spacing,
  keyboard focus and footer to the inner layouts through `nova-inner`.
- `SpaceBackground` uses stable decorative stars and CSS animation without pointer
  listeners, video playback, WebGL or an external media request.
- Existing CSS modules retain their page layout and state behavior, with a shared
  translucent surface treatment and consistent action shapes.
- Journal and achievement page heroes use credited mission imagery. Achievement
  cards also show the corresponding spacecraft with credits and image fallbacks.
- The rebuilt inner-page footer includes academy navigation, NASA resources,
  image credit, project context and a reduced-motion-aware back-to-top control.
- The main menu now remains available between phone and desktop widths.
- New animations stop when reduced motion is requested. Decorative stars are
  hidden from assistive technology. The photograph has a dark fallback background.

## Image provenance

`public/assets/common/night-sky.jpg` is the locally served, resized NASA/JAXA
photograph from [Milky Way Views](https://www.nasa.gov/image-article/milky-way-views/).
The verified source credits NASA; JAXA. Original image:
<https://www.nasa.gov/wp-content/uploads/2025/09/iss073e0516005orig.jpg>.
The download uses the source's 2000 x 1333 derivative (approximately 716 KiB).
The footer links to the source and explains that the background is an archival
photograph with decorative animation. It is not a live sky feed or a scientific
simulation. No AI-generated imagery was introduced.

Mission imagery reuses existing credited local assets and metadata without
changing the home page's asset files.

## Validation

- `npm run typecheck`: passed.
- `npm run build`: passed, including TypeScript. Vite still reports the large
  main bundle and mission package static/dynamic import warnings.
- `npm run lint`: passed, including the final clipping and navigation changes.
- `npm test -- src/pages src/app src/components --maxWorkers=1
  --testTimeout=60000 --hookTimeout=60000`: 15 files, 84 tests passed. Earlier
  default-timeout runs timed out under load and were stopped; the slower
  single-worker run completed successfully. A redundant thread-pool launch was
  canceled once the passing result arrived.
- Initial Playwright batch: all nine auth checks, the three inner-page flows,
  and mobile/desktop home regression cases passed. The tablet home case timed
  out waiting for its heading. The runner was stopped after all cases reported.
- Screenshot review covered phone auth/dashboard/journal, tablet achievements
  and desktop dashboard. It exposed programmatic image scrolling that could
  shift hero text horizontally. Dashboard, profile and dossier hero clipping
  now uses `overflow: clip`; the browser flow asserts dashboard scroll position
  and callsign alignment.
- The updated browser flow also checks the background, its source link,
  reduced-motion behavior and keyboard menu access below desktop width.
- Final `npm run test:e2e -- e2e/platform-style.spec.ts`: all three viewport
  cases reported passed after the clipping fix. The runner stalled during
  teardown after the last result and was stopped; a clean runner exit is not
  claimed for this batch. The isolated tablet home regression
  rerun also passed with a 30-second assertion timeout, using the existing local
  server and a temporary configuration. No home code or tests were changed.
- These browser tests use local assets and isolated synthetic acceptance data;
  Auth/Data API and external requests are blocked. They do not validate hosted
  sessions or persistence.
- `git diff --check`: passed. Git diff confirms no changes to the landing page,
  its components, global design tokens or original image assets.

## File inventory

Created: `src/styles/observatory.css`, `public/assets/common/night-sky.jpg` and
this report.

Modified layout components: `AppLayout.tsx`, `PublicLayout.tsx`,
`MissionLayout.tsx`, `Navbar.tsx`, `SpaceBackground.tsx`, and `Footer.tsx` under
`src/components/layout/`.

Modified pages/components: `AchievementsPage.tsx`, `JournalPage.tsx`,
`NotFoundPage.tsx`, `AuthPage.module.css`, `components/PageShell.tsx`,
`components/achievements/AchievementCard.tsx` under `src/pages/`.
Modified CSS modules under `src/pages/components/`: dashboard, profile,
journal, achievements and mission presentation.

Validation/status changes: `e2e/platform-style.spec.ts`, `AGENTS.md` and
`PROJECT_CONTEXT.md`.

## Limits and next step

This update changes presentation only. Hosted JWT/API, concurrent rewards and
registered persistence acceptance remain separate open gates. No hosted data was
modified. No dependencies were added, and no commit, push or deployment was made.
Recommended next step: review the redesigned pages on a learner's device and
collect usability feedback.
