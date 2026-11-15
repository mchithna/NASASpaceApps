# Opportunity — The Explorer That Wouldn't Stop

Seven connected scenes loaded through the existing package loader. Open Mission
Control → Opportunity → Start mission. Estimated reading/activity time: 8–12
minutes; this has not been measured with learners.

| Scene | Required interaction | Platform outcome |
| --- | --- | --- |
| The Day Mars Went Silent | Begin Investigation; illustrated signal | No XP |
| Meet Opportunity | Inspect any three of six equipment hotspots | `introduction`: 20 XP |
| Was Mars Once Wet? | Inspect both clues; interpret ancient-water evidence | No XP |
| The Journey Beyond Expectations | Eagle → Endurance → Victoria → Endeavour; inspect each target | `activity`: 40 XP |
| More Evidence, More Questions | Match three mineral clues to interpretations | `discovery`: 25 XP; `opportunity-notes` |
| When the Sunlight Disappeared | Increase illustrative airborne dust; review historical outcome | No XP |
| The Explorer That Wouldn't Stop | Reorder four historical milestones | Completion, `legacy`: 15 XP; `opportunity-story` / Martian Trailblazer |

Activities report `onComplete` only. The shared player and services save scene
checkpoints, award fixed milestones, publish journal discoveries and complete the
mission. No mission component imports Supabase or computes XP. Incorrect answers
remain retryable; save buttons remain available after failed writes. Replays use
the player's Next/Back controls and send no reward or checkpoint writes; activities
can still be explored. Unfinished activity inputs restart on leaving/reloading;
completed scene checkpoints remain saved. Guest progress follows the existing
tab-local boundary; accounts use the existing authenticated services. Guest and
account progress are not merged.

## Authorized shared integration

The user explicitly approved minimal coordinated changes during this task:

- `src/engine/validateModule.ts`: allow an ending scene to use the existing
  optional interaction. Existing guards gate the timeline; no new player or scene
  kind was introduced. `src/engine/scenes.ts` documents the supported interaction.
- `src/contracts/rewards.ts`: name Martian Trailblazer and publish sourced
  Opportunity journal copy for guest/mock services.
- The trusted catalog migration adds seven scene rows, explicit milestone
  checkpoints and discovery text. Player data, RPCs, locks, RLS and fixed XP are
  preserved. Hosted inspection found no existing Opportunity scenes/progress.

Migration generated with `supabase migration new opportunity_chapter` through
npx, then applied to `ptjvlycaiigigdrcybet` as version `20261115083036`. The local
filename follows the hosted version. Read-only verification confirmed all seven
scene IDs/order/kinds, rewards on scenes 2/4/5, the sourced discovery reference,
no anonymous catalog reads and no authenticated catalog inserts. This inspection
does not substitute for registered-player browser/JWT acceptance.

## NASA sources and media

Checked 2026-11-15. Every factual scene links its applicable NASA source records.

- [Opportunity overview](https://science.nasa.gov/mission/mer-opportunity/):
  objectives, instruments and crater exploration sequence.
- [Rover instruments](https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/science-instruments/):
  Pancam, Microscopic Imager, spectrometers and Rock Abrasion Tool.
- [Science highlights](https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/science-highlights/):
  hematite, gypsum, clay and their environmental interpretations.
- [Six things to know](https://science.nasa.gov/missions/mer/six-things-to-know-about-nasas-opportunity-rover/):
  mission duration and solar-power context.
- [Mission end](https://science.nasa.gov/missions/mer/nasas-opportunity-rover-mission-on-mars-comes-to-end/):
  90-sol primary mission, final communication and recovery attempts.
- [Final traverse map](https://science.nasa.gov/photojournal/opportunitys-final-traverse-map/):
  final distance, 45.16 km. The activity route is expressly a schematic and not
  this measured traverse or a driving simulator.
- [Final panorama](https://www.jpl.nasa.gov/news/opportunitys-parting-shot-was-a-beautiful-panorama/):
  Perseverance Valley, panorama processing and mission legacy.

Local assets and original download/catalog metadata are in
`public/assets/missions/opportunity/media.json`. Credits appear beside pictures.

| Asset | Credit / processing |
| --- | --- |
| `eagle-crater.jpg` / PIA05755 | NASA/JPL/Cornell; approximate true color |
| `blueberries.jpg` / PIA05564 | NASA/JPL; Microscopic Imager mosaic |
| `endurance-shadow.jpg` | NASA/JPL-Caltech; hazard-camera photograph, July 26, 2004 |
| `victoria-crater.jpg` | NASA/JPL-Caltech/Cornell; Cape Verde view |
| `endeavour-crater.jpg` / PIA18393 | NASA/JPL-Caltech/Cornell Univ./Arizona State Univ.; Pillinger Point |
| `gypsum-vein.jpg` / PIA15033 | NASA/JPL-Caltech/Cornell/ASU; Homestake color view |
| `final-panorama.jpg` / PIA22909 | NASA/JPL-Caltech/Cornell/ASU; approximate true color, some monochrome frames |

No generated bitmap media or fictional radio farewell is used. The rover drawing,
signal and expedition route are illustrations/reconstructions. The storm uses
qualitative sunlight/power states, not NASA telemetry; it cannot change history.
Past water/habitability is explicitly distinguished from evidence of life. No
current rover-distance-record claim is made.

## Validation and limits

`chapter.test.tsx` covers the complete flow, activity guards, retry, failed saves,
resume, rewards, discovery, achievement and replay. A separate test recreates real
guest services to check serialized tab storage. `backend.test.ts` executes the
complete migration chain in embedded PostgreSQL and checks trusted reward timing
and idempotency. `chapter.browser.ts` exercises existing application routes at
375px/1280px with keyboard input and reduced motion. Its package-local Playwright
configuration adds no production route or dependency.

The browser test explicitly selects `/?acceptance=training`, the existing
tab-persisted development acceptance fixture. Ordinary development mock mode
deliberately resets on refresh. Neither mode is a live registered account test.

Checks executed on 2026-11-15:

| Command / check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run build` | Passed; bundle-size and ineffective dynamic-import warnings |
| `npx vitest run src/missions/opportunity src/missions/surveyor-3 src/missions/registry.test.ts --maxWorkers=1` | 13 tests passed in 5 files, including both chapters' embedded database tests |
| `npx playwright test --config src/missions/opportunity/playwright.config.ts` | Mobile 375px and desktop 1280px passed; keyboard, retries, refresh/resume, completion, shared profile/journal/achievement state and replay |
| Hosted catalog / privilege SQL | Seven scenes, explicit reward mapping and sourced discovery confirmed read-only |

The wider engine/contract/reward regression run passed 74 shared tests. Its
original registry assertion still expected Opportunity to be planned with an SVG
placeholder; those expectations were corrected and all five registry tests passed
in the final chapter run above. Earlier sandbox runs also hit worker/process
cleanup timeouts; final mission/browser runs succeeded outside the Windows
sandbox. Screenshots of expedition, storm and legacy were inspected. The complete
repository suite and live registered-account/JWT/concurrency acceptance were not
run for this chapter.

Changed files: this package's metadata, loader export, chapter, content, local CSS,
two activity modules, tests/config and README; the seven credited photographs and
their metadata; the authorized engine validator/type comment, reward catalog,
registry test, trusted catalog migration and current-status paragraphs in
`AGENTS.md` / `PROJECT_CONTEXT.md`. No dependencies were added. The central router,
providers, design tokens, player presentation and other mission packages were not
edited by this chapter task.

The journal contract has no image field. Its summary includes the official source
reference; related NASA imagery appears in the chapter. The existing player
supplies Exit mission, Start again and chapter-complete feedback. Registered
hosted JWT/browser/concurrency acceptance and learner timing studies are not
claimed. The foundation remains unfrozen. See the final report for checks run.
