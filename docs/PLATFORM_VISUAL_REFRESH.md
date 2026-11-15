# Platform visual refresh

Date: 2026-11-15. Scope: bring learner-facing pages into the home page's existing
visual language. This is local repository work; no new hosting project, package,
database migration, AI provider or application dependency was added.

## Presentation changes

- One floating navigation bar with the existing NovaExplorer logo, active-route
  pills, session control and keyboard-accessible mobile menu.
- Scoped home-palette aliases: near-black backgrounds, dark blue cards, lime
  primary actions, blue focus/science accents and retained semantic reward/error
  colors. The home page's source and global baseline tokens are unchanged.
- Image-led page headers with readable content, orbital details and source links.
  The existing landing page photographs, mosaics and artist concepts are reused,
  retaining their credit and media-type labels. No new scientific claims or
  generated NASA art were introduced.
- Dashboard cards use real mission imagery; metrics and profile summaries have
  clearer hierarchy. Profile editing uses a responsive two-column composition.
  Phone avatar choices become readable full-width cards.
- Journal entries combine mission imagery, discovery content and NASA sources.
  Achievement cards have mission artwork and retain actual unlock states.
- Explorer setup has a cinematic header and coordinated form panels. Auth keeps
  its existing artwork and functionality with a matching pill-shaped header.
- Mission overviews replace placeholder covers with a dossier, source panel and
  clear launch action. Available versus unbuilt chapters are described accurately.
  The mission player inherits the same surfaces, controls and typography, plus a
  credited scene-setting banner. The not-found screen uses the same visual system.
- Entry, float and hover motion is disabled for reduced-motion preferences. Image
  failures show an accessible fallback while preserving the original source link.

## Files

- New `src/styles/platform.css`, shared `PlatformHeader.tsx` in the layout folder,
  and `PageHero.tsx` / `SpaceArtwork.tsx` in page components.
- Layout composition: `LayoutFrame.tsx`, `AppLayout.tsx`, `PublicLayout.tsx`,
  `MissionLayout.tsx`, `MissionFacts.tsx`; `Card.tsx` adds only a styling hook.
- Page components: `PageShell.tsx`, `StatCard.tsx`, `MissionControlHero.tsx`,
  `MissionDashboardCard.tsx`, `ActiveMissionSpotlight.tsx`.
- Product pages: Dashboard, Profile, Journal, Achievements, Onboarding, Mission
  Overview, Mission Player, Not Found; `AuthPage.module.css` updates the header.
- Tests: `SpaceArtwork.test.tsx`, `e2e/platform-style.spec.ts`, and two stale
  assertions in `phase4bServicesIntegration.test.tsx` updated to current badge and
  guest-disclosure copy. `AGENTS.md` and `PROJECT_CONTEXT.md` record current status.

The central router, mission engine behavior, chapter activities, service/provider
selection, contracts, reward values, identity isolation, database and `.env` are
unchanged. Internal development showcase/training routes are not product designs.

## Validation

TypeScript checking and a production build passed during implementation. Vite
retains the known static/dynamic mission import warnings and bundle-size warning.

Initial targeted UI/component/chapter run: 74 passed, 2 failed. Both failures were
stale presentation assertions: `Opportunity Story` versus the catalog's title,
and the guest warning copy from the prior auth presentation. After correcting
those expectations, the affected integration file passed all 8 tests.

The initial desktop browser flow passed. Phone/tablet image checks were corrected
to scroll lazy-loaded imagery into view before asserting image loading. Visual
review then corrected phone avatar wrapping, the character counter and image
credit opacity. Final results are recorded below once remaining checks finish.

Browser checks use the explicitly isolated development fixture, block Auth/Data
API and external requests, and use local image assets. They do not contact hosted
accounts or create real rewards. Fonts use locally available fallbacks in that
environment. Existing source links and credits remain visible in the product.

This visual refresh does not close hosted JWT/API or concurrency acceptance gates,
add any chapter, change reward behavior, or establish a foundation freeze.
Recommended next step: review the refreshed screens on a learner's phone and
collect usability feedback before adding further features.
