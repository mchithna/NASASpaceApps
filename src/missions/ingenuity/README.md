# Ingenuity — Five Flights Became Seventy-Two

Implemented on `feature/ai` using the existing Mission Player, package loader,
activity callback, checkpoint and reward services. Home page source, other
chapters, authentication, routing, global tokens and reward logic are unchanged.
No dependencies, commits, pushes or hosted writes were made.

| Scene | Required activity | Shared outcome |
| --- | --- | --- |
| What If We Could Fly on Mars? | Begin Flight Training; NASA surface photograph | No XP |
| Meet the Little Helicopter That Could | Inspect four of five components; optional rotor motion and NASA anatomy diagram | Introduction: 20 XP |
| Can a Helicopter Fly in the Thin Martian Air? | Compare Earth/Mars and rotor configurations; run a successful Mars test | No XP |
| Mission Control: Ready for Takeoff | Four preflight checks, reusable command ordering, autonomous animated flight | Activity: 40 XP |
| The Sky Was No Longer the Limit | Inspect terrain, choose a corridor and suitable landing zone | No XP |
| What Happened to Flight 72? | Terrain, navigation comparison, rotor shadow and engineering deduction | Discovery: 25 XP; `ingenuity-notes` |
| Five Flights Became Seventy-Two | Reusable legacy timeline | Legacy: 15 XP; `ingenuity-story` |

The existing achievement display name **Ingenuity story** is preserved as requested
when a name already exists. Maximum mission reward is 100 XP. Activities emit only
`onComplete`; the engine saves checkpoints and awards catalog milestones. Retry
buttons remain usable after failed writes. The final screen does not claim XP,
achievement or journal persistence before the shared runtime confirms completion.
Exit/Mission Control and Start again are the existing return and replay controls.

## Authorized shared integration

The user approved minimal coordinated catalog integration during this task.
Only `ingenuity-notes` in `src/contracts/rewards.ts` changes: the sourced entry
**The Final Flight of Ingenuity** includes the January 18, 2024 date, evidence,
likely navigation/landing sequence and official NASA investigation reference.
The achievement ID/name and all reward logic remain unchanged.

`supabase/migrations/20261115134651_ingenuity_chapter.sql` adds seven trusted
scene rows with Introduction/Activity/Discovery at scenes 2/4/6. Its filename was
generated with `npx supabase migration new ingenuity_chapter`. The embedded
PostgreSQL test executes the actual migration chain and checks the existing
RPCs, discovery copy, 100 XP cap and idempotent completion. No player records,
RPCs, privileges or policies are modified.

**Deployment limit:** this migration is prepared locally, not applied to the
hosted project. Registered saves require its deployment. No live registered
browser/JWT/concurrency acceptance is claimed. Guest/training journal entries
now use the sourced shared catalog. The journal contract has no image field;
the related NASA image appears in the chapter and the summary contains its
NASA investigation reference. No alternate progress/journal system was added.

## NASA references and imagery

Facts and original credits checked November 15, 2026. Scene citations resolve
through `mission.sources`; the download record is in
`public/assets/missions/ingenuity/attribution.json`.

- [NASA mission overview](https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/): arrival, five planned/72 completed flights and aerial scouting.
- [NASA/JPL hardware press kit](https://www.jpl.nasa.gov/news/press_kits/ingenuity/landing/mission/spacecraft/): lightweight construction, counter-rotating rotors, cameras, electronics and initial approximately 2,400 rpm design.
- [Historic first flight](https://www.nasa.gov/news-release/nasas-ingenuity-mars-helicopter-succeeds-in-historic-first-flight/): April 19, 2021; 3 m, 30-second hover, 39.1-second total; onboard autonomous control.
- [First-flight video](https://science.nasa.gov/resource/first-video-of-nasas-ingenuity-mars-helicopter-in-flight/): linked as optional historical footage, never autoplayed.
- [Flying mission conclusion](https://www.jpl.nasa.gov/news/after-three-years-on-mars-nasas-ingenuity-helicopter-mission-ends/): January 18 final flight and January 25, 2024 announcement.
- [NASA Flight 72 investigation](https://www.nasa.gov/missions/mars-2020-perseverance/ingenuity-helicopter/nasa-performs-first-aircraft-accident-investigation-on-another-world/) and [most likely hard-landing scenario](https://www.jpl.nasa.gov/images/pia26482-ingenuitys-hard-landing/): feature-poor navigation, likely accident sequence and engineering lessons. The activity does not claim to prove the cause.

| Local WebP asset | Origin and credit |
| --- | --- |
| `ingenuity-mars.webp` | PIA25968 main view, August 2, 2023; NASA/JPL-Caltech/ASU/MSSS. Not enhanced-color Figure A. |
| `components.webp` | NASA/JPL-Caltech aircraft anatomy illustration; landing press kit. |
| `first-flight.webp` | PIA24584, April 19, 2021, navigation-camera image; NASA/JPL-Caltech. |
| `sand-ripples.webp` | PIA26242, Flight 70, December 22, 2023; NASA/JPL-Caltech. Context image, not footage of Flight 72 or the hypothetical scout. |
| `damaged-rotor.webp` | PIA26243, shadow captured after Flight 72; NASA/JPL-Caltech. |

Images are web-sized NASA derivatives converted locally to WebP, preserving aspect
ratio; original references and processing are retained. Text alternatives and
shared image error states preserve usability if media fails. The first-flight
photograph/video is optional media behind a disclosure; no video must download
to finish. No generated raster art, logos, fictional telemetry or crash footage
is used.

## Interaction and animation design

SVG helicopter with four blades/two coaxial rotors; controllable inspection rotor
motion; atmosphere particle comparison; state-driven spin-up, takeoff, hover,
descent and touchdown; dust and HUD stage indicators; route drawing and aircraft
marker; engineering evidence comparison, enlarged rotor photograph; completion
panels and legacy counters. The flight animation is accelerated and labeled as
an educational reconstruction, never real-time NASA footage. Manual stage/skip
controls work independently of CSS animation; timers are cleaned up on exit.
Reduced motion removes animated transforms/transitions and animated particles. Mobile
uses labeled component buttons instead of tiny hotspots. All interactions use
buttons/radios and visible keyboard focus; success is conveyed through text.

The atmosphere lab is qualitative, not a physics model. Ground patterns and camera
markers are illustrations. The scouting map is a hypothetical route with no
invented coordinates or claimed exact historical path. Smooth terrain is not
declared universally unsafe: the explanation covers obstacles, slope and visual
tracking. Ingenuity is distinguished from Perseverance’s sampling instruments.

Completed scenes persist through the existing checkpoint system; unfinished
within-scene inputs restart after refresh. Guest progress stays tab-local and
separate from registered accounts. Replays send no reward writes. Estimated
8–12 minute pacing has not been measured with learners.

## Validation

Executed November 15, 2026:

| Command | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run build` | Passed; existing bundle-size and ineffective dynamic-import warnings |
| `npx vitest run src/missions/ingenuity src/missions/opportunity src/missions/surveyor-3 --maxWorkers=1` | 12 passed before shared catalog integration |
| `npx vitest run src/missions/ingenuity src/missions/registry.test.ts --maxWorkers=1` | 10 passed, including isolated catalog/RPC checks |
| `npm test -- --maxWorkers=2` | 232 passed, 2 skipped; one existing sign-in test timed out at 5 seconds. Its file passed all 10 tests when rerun alone. |
| `npm test -- --maxWorkers=1` after catalog integration | 231 passed, 2 skipped; two journal tests still expected the old placeholder title. Those assertions were updated; their entire file subsequently passed all 10 tests. The entire suite was not rerun after that expectation-only correction. |
| `npx vitest run src/pages/ProfileJournalAchievements.test.tsx --maxWorkers=1` | Final rerun: 10 passed. Registered mock seed retains its deliberate simulation label; newly earned guest entries use sourced catalog copy. |
| `npx playwright test --config src/missions/ingenuity/playwright.config.ts` | All 3 viewport journeys passed with the integrated catalog: phone/reduced motion, tablet and desktop |
| `npx playwright test --config src/missions/ingenuity/playwright.config.ts --project mobile-reduced` | Final phone layout/lazy-media check passed |
| `git diff --check` | Passed |

See the final task report for final executed commands and results. Tests include
full component playthrough, gated activities, wrong answers, failed-save retry,
resume, 100 XP, discovery/achievement IDs and replay; flight state transitions;
image failure; catalog RPC/reward validation in embedded PostgreSQL;
browser playthrough at 375px/768px/1280px, keyboard controls, reduced motion,
refresh/resume, images, overflow and shared profile/journal/achievement screens.
The browser uses the existing isolated `/?acceptance=training` fixture, with
Supabase networking blocked. This is not live registered-account acceptance.

Files: package metadata/export, chapter, content, flight reducer, three activity
modules, helicopter component, local CSS, tests/Playwright configuration, trusted
catalog migration and this README; five local WebP assets and attribution metadata. The
shared registry test only updates its expected availability/cover for Ingenuity;
the journal test updates the old placeholder-title expectation. The authorized
shared reward-catalog entry and required AGENTS status note are also updated.
Production registry code is unchanged.
