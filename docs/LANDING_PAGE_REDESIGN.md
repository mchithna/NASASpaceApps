# Home Page redesign — implementation and validation

Prepared on 15 November 2026 on the existing `develop` checkout. Browser acceptance remains open.

## Changes

- Reworked the Home Page into a cinematic Mars composition with the existing Space Grotesk and Inter fonts, a pale lime accent, floating glass navigation, restrained stars and orbit highlights, and pointer parallax confined to decoration.
- Added one descriptive h1, keyboard-operable mobile disclosure navigation, Escape focus restoration, section focus after anchor navigation, visible focus rings, and reduced-motion handling. The header stays below the shared skip link.
- Kept exactly five mission cards driven by `listMissions()`. Each whole card opens the existing mission overview route. Lazy responsive images have reserved layout space and an unavailable-image fallback.
- Added the four-step process, an About section, an independence notice, and expandable image and information credits. Planned chapters are explicitly described as in development. No telemetry, XP, or gameplay is fabricated.
- Kept CSS scoped beneath `.nova-landing`, using existing landing design tokens. No shared tokens, router, providers, contracts, auth, Supabase, progress, or engine implementation were changed by this task.

## Files changed by this task

- `src/pages/LandingPage.tsx`
- `src/pages/components/landing/LandingNavbar.tsx`
- `src/pages/components/landing/LandingHero.tsx`
- `src/pages/components/landing/LandingMissions.tsx`
- `src/pages/components/landing/LandingHowItWorks.tsx`
- `src/pages/components/landing/LandingAbout.tsx`
- `src/pages/components/landing/LandingFooter.tsx`
- `src/pages/components/landing/landingNavigation.ts`
- `src/pages/components/landing/landingMedia.ts` (new)
- `src/pages/components/landing/landing.css` (new)
- `src/pages/LandingPage.test.tsx`
- `src/app/routes.test.tsx` (Home Page heading assertion only)
- `e2e/landing.spec.ts` (new, not executed)
- `public/assets/common/landing/mars.webp` (new)
- `public/assets/common/landing/{surveyor-3,opportunity,ingenuity,insight,pioneer-10}-{480,960}.webp` (10 new files)
- `public/assets/common/landing/sources.json` (new)
- `docs/LANDING_PAGE_REDESIGN.md` (this report)

Existing unrelated changes and staged files in the checkout were preserved. No commit or push was performed by this task. Original JPEGs and mission-owned assets remain untouched.

## Assets and usage

The 11 WebP files total 658,084 bytes (about 643 KiB). The hero uses the NASA/JPL/USGS Viking mosaic PIA00003. Surveyor 3 uses the Apollo 12 photograph AS12-48-7121, credited to NASA/JSC. Opportunity uses NASA's Mars Exploration Rover artist concept PIA04928, credited to NASA/JPL/Cornell University/Maas Digital; this depicts the rover design shared by Spirit and Opportunity. Ingenuity uses PIA23961, credited to NASA/JPL-Caltech. InSight and Pioneer 10 use the illustrations on their official NASA mission pages.

Original asset URLs, source pages, and credits are recorded in `public/assets/common/landing/sources.json`. The footer provides the same source path to learners and links to [NASA media usage guidance](https://www.nasa.gov/nasa-brand-center/images-and-media/). Educational use retains the source credits; third-party rights remain with their owners. Images were resized and compressed without changing their scientific subject. Card images are cropped in CSS. The hero's stars, lighting, horizon, and orbit curves are decorative CSS composition, visibly identified as an illustrative scene. No AI-generated media was added.

## Validation

- `npm run typecheck`: passed after fixing an unsupported query option in the new tests.
- `npm run lint`: passed after moving shared media data out of the component file to satisfy Fast Refresh.
- `npm run test`: initial unrestricted run was interrupted after multiple timeouts while checks competed for resources.
- `npm run test -- --maxWorkers=2 --testTimeout=15000`: completed with **212 passed, 1 failed, 2 skipped** across 36 files. The failure is `src/pages/phase4bServicesIntegration.test.tsx:302`, which expects the old Auth Page text `Guest Recovery Limitation:`. The existing Auth Page instead contains the redesigned guest explanation. This task did not modify Auth Page or that integration test.
- `npm run test -- src/pages/LandingPage.test.tsx src/app/routes.test.tsx --maxWorkers=1 --testTimeout=15000`: **13 passed** across both files.
- `npm run build`: passed. Vite reports existing ineffective dynamic-import warnings because mission packages are also imported statically by the registry.
- `git diff --check`: passed.
- Inspected all selected spacecraft source images directly. Browser visual comparison, responsive overflow, actual image loading, animation, and end-to-end navigation are **not verified**: the first in-app browser attach timed out, then the localhost approval gate declined access. No alternate browser mechanism was used to bypass that decision. Playwright coverage was added but not run for the same reason.

## Gemini follow-up

The repository already has `.env.example` and `src/config/gemini.ts` centralizing `VITE_GEMINI_API_KEY`; these were not changed. No key was supplied in the prompt. The requested mission-question assistant is deferred to a separate feature task, as clarified during this work. It is not connected or presented as available on the Home Page. Before connecting a private key, put provider calls behind a server endpoint and load the key from server-side environment configuration: Vite-prefixed variables are browser configuration. Verify current supported model identifiers when that feature is implemented rather than treating the supplied model list as verified provider documentation.

## Next step

Complete desktop (1440 px), tablet (768 px), and mobile (320/375 px) visual and keyboard acceptance when local browser access is available. Run `npm run test:e2e -- e2e/landing.spec.ts` after building. Review the existing auth-copy test failure separately. The Gemini assistant should be its own scoped implementation task.

## Follow-up: round 3D-style Mars globe

The Mars hero now crops the mosaic into a smooth circular surface, keeping its irregular source boundaries outside the visible mask. Warm rim lighting, curved radial shading, and restrained atmospheric and inset shadows add spherical depth without changing the source image file. Tablet and phone positioning now keeps the globe's circular silhouette inside the viewport. Footer credits explicitly identify the cropped mosaic detail.

Files changed for this refinement: `src/pages/components/landing/landing.css`, `src/pages/components/landing/LandingFooter.tsx`, and this report. No assets or dependencies were added. TypeScript and lint passed; all 7 landing-page tests passed. Browser visual acceptance remains blocked by the previously declined local-preview access. The production build result is reported in the completion response.

## Follow-up: planet spin

The decorative Mars surface now completes a smooth rotation every 90 seconds using a CSS transform. The circular mask, rim light, and shadow remain stationary to preserve the globe's depth. The spin is enabled only for `prefers-reduced-motion: no-preference`; reduced motion keeps it static. This is an illustrative animation, not a representation of Mars' actual rotation period. Only `landing.css` and this report changed for this step; no assets or dependencies were added. Browser motion verification remains blocked by the earlier preview-access decision.
