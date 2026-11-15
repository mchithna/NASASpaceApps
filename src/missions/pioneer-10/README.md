# Pioneer 10 — The Messenger That Never Came Home

Seven scenes use the existing chapter loader, Mission Player, activity callbacks,
checkpoints and rewards. No dependencies or second player/progress system.
Home page, auth, routing implementation, reward logic, global tokens and other
mission packages are unchanged. No commits, pushes or merges were performed.

| Scene | Required interaction | Platform outcome |
| --- | --- | --- |
| The Last Whisper From Deep Space | Trace the Signal; labeled artistic waveform | No XP |
| Meet Pioneer 10 | Inspect four of five systems; diagram and list controls | Introduction: 20 XP |
| Into Uncharted Territory | Order journey, survey debris, interpret sparse belt | No XP |
| Jupiter: A Giant Revealed | Approach; investigate three instrument/observation pairs; continue outward | Activity: 40 XP |
| A Message From Humanity | Inspect/zoom four authentic plaque regions; match their meanings | Discovery: 25 XP; `pioneer-10-notes` |
| The Faintest Voice Across the Stars | Distance slider, historical preset, two challenges and interpretation | No XP |
| The Messenger That Never Came Home | Order five legacy events | Legacy: 15 XP; `pioneer-10-story` |

Metadata ID/title/description/destination/category/cover path/achievement ID are
preserved; status becomes `available` and NASA references are added. The existing
achievement name **Pioneer 10 story** is preserved. Fixed rewards total at most
100 XP. Activities emit only `onComplete`; the engine confirms saves/rewards.
Failed writes retain local results and retry controls. Replays send no writes.
Partial activity inputs restart on refresh; completed scene checkpoints and earned
outcomes use shared storage. Guest progress remains tab-local and separate from
accounts. Existing player controls provide exit, Mission Control and replay.

## Minimal catalog integration and deployment

Following the established integration pattern, only Pioneer 10's shared journal
copy changes in `src/contracts/rewards.ts`: **The Pioneer Plaque — A Message From
Humanity**, the four symbols, physical-message purpose and NASA reference, with
`contentStatus: 'sourced'`. No service or reward logic changes.

`20261115143538_pioneer_10_chapter.sql`, generated with
`npx supabase migration new pioneer_10_chapter`, adds seven trusted scene rows
and rewards on scenes 2/4/5. Existing RPCs enforce ordering and idempotency; player
data, policies, grants, functions and schema structures are preserved.
**This migration is local, not deployed.** Registered saves require deployment of
the pending migration chain. Live account/JWT/concurrency acceptance is unverified.
The journal contract has no observation image field; the authentic plaque is shown
in the chapter and the journal contains its NASA reference. Existing contextual
journal imagery is preserved. Production registry/router are unchanged; their
tests update availability and use unbuilt InSight for the preparation notice.

## NASA references and media

Checked November 15, 2026. Each factual scene resolves its own NASA citations.

- [Mission overview](https://science.nasa.gov/mission/pioneer-10/): mission objectives, instruments and milestones.
- [Last signal](https://science.nasa.gov/missions/pioneer/pioneer-10-sends-last-signal/): April 27, 2002 telemetry; January 23, 2003 final detected signal; unsuccessful 2006 attempt and declining power.
- [Launch history](https://www.nasa.gov/history/50-years-ago-pioneer-10-launches-to-explore-jupiter/): 21-month plan, March 2, 1972 launch, belt crossing, equipment, artwork and images.
- [Jupiter history](https://www.nasa.gov/history/45-years-ago-pioneer-10-first-to-explore-jupiter/): science/engineering legacy, contact history and approximately 11-hour-20-minute final delay.
- [Jupiter observations](https://science.nasa.gov/resource/pioneer-10-at-jupiter/): historical image sequence and measurements.
- [Plaque](https://science.nasa.gov/resource/pioneer-plaque/) and [symbol explanation](https://science.nasa.gov/image-article/apod-1996-june-30-greetings-from-the-pioneers/): hydrogen, pulsars, human figures/scale and Earth origin.
- [Dawn FAQ](https://science.nasa.gov/mission/dawn/faq/): mostly empty asteroid belt.
- [Deep Space Network](https://www.nasa.gov/communicating-with-missions/dsn/): ground radio communication.

Closest Jupiter approach is explicitly **December 4, 1973, UTC**, approximately
130,000 km above cloud tops; some retrospectives use December 3 in U.S. time.
No claim of landing, Jupiter orbit, arrival at another star, current detectable
transmissions or a particular interstellar-boundary crossing is made. Outdated
archive wording is not repeated as a present-day trajectory assertion.
Intermediate delays are illustrative calculations: distance ÷ 299,792.458 km/s,
rounded to the nearest minute. The historical preset is about 12.23 billion km
and 11 hours 20 minutes. There are no invented power percentages, signal-strength
measurements or recovered audio. Declining RTG power is separate from distance.

Eight local, web-sized WebP assets retain download URLs and credits in
`public/assets/missions/pioneer-10/image-credits.json`:

| Asset | Credit / interpretation |
| --- | --- |
| `deep-space-art.webp` | NASA/Don Davis; *Pioneer 10 Leaving the Planets Behind*, artwork |
| `jupiter-flyby-art.webp` | NASA/Rick Guidice; encounter artwork |
| `spacecraft-diagram.webp` | NASA; instrument-location reference, original small resolution |
| `jupiter-observations.webp` | NASA; Pioneer 10 Jupiter/Europa/Ganymede composite, not to scale |
| `jupiter-1973.webp` | NASA; historical observation sequence, multiple images |
| `pioneer-plaque.webp` | NASA Ames; authentic historical diagram, human figures preserved |
| `dsn-goldstone.webp` | NASA/JPL-Caltech, PIA23214; February 11, 2020 context, not the 2003 reception |
| `earth.webp` | NASA/Apollo 17 crew, December 1972 context, not a Pioneer photograph |

Original `cover.svg` remains the labeled placeholder to preserve the metadata
path. The playable chapter uses the NASA media above. No generated raster media,
new NASA logos, altered identifiers or fictional spacecraft photographs are used.
Images use alt text/shared error fallbacks; optional references use disclosures.

## Interaction, animation and accessibility

Scoped deep navy/cyan/amber/gold visuals preserve the global theme. The intro has
a finite illustrated waveform fade/star-field reveal. A separate plaque detail
avoids inventing its mounting location on a view where it is hidden. Belt orbits,
particle sizes and route are schematic, not a movie-style obstacle course.

Explicit ready/approach/encounter/outbound Jupiter states gate three scientific
investigations. NASA imagery supplies the planet; field lines, sizes and path are
illustrations. Controls advance phases without waiting for animation events.
Plaque zoom stays contained and includes labeled list alternatives, matching and
reset/retry. Radio pulses are user-triggered finite historical illustrations;
screen motion is greatly accelerated. No animation is a completion authority.
Reduced motion disables animations/transitions while preserving interaction and
explanations. All activities use keyboard controls, visible focus and text feedback.
Mobile uses large labeled controls; no sound is required.

## Validation and files

Executed November 15, 2026:

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run build` | Passed; existing bundle-size and ineffective dynamic-import warnings |
| `npx vitest run src/missions/pioneer-10 src/missions/registry.test.ts --maxWorkers=1` | Final rerun: 9 passed in 3 files, including the actual migration/RPC test |
| Selected existing contract/reward tests via `npm test` | 14 passed; the accompanying route run had one 5-second home-shell timeout under parallel browser load |
| `npx vitest run src/app/routes.test.tsx --maxWorkers=1` | Isolated rerun: all 7 passed; no home page source change |
| `npx playwright test --config src/missions/pioneer-10/playwright.config.ts` | Three full journeys passed: 375px/reduced motion, 768px and 1280px |
| `npx playwright test --config src/missions/pioneer-10/playwright.config.ts --project mobile-reduced` | Phone visual-refinement rerun passed |
| `git diff HEAD --check` | Passed; includes staged and unstaged changes |

`chapter.test.tsx` covers contracts, reward mapping, calculated delays, full play,
guards, retries, matching reset, failed save, resume, journal, achievement and
reward-free replay. `backend.test.ts` runs the real migration chain/RPCs in isolated
embedded PostgreSQL, including premature-reward rejection and repeated completion.
Browser checks follow actual routes at 375px/768px/1280px, with keyboard/reduced
motion, images, contained zoom, overflow, refresh, shared outcomes and replay.
They use the existing `/?acceptance=training` fixture with Supabase requests
blocked; they are not live account tests. See the final report for actual results.
The whole repository suite and learner pacing studies are not claimed.

Changed files: this package's export/metadata, chapter, content, spacecraft SVG,
three activity modules, scoped CSS, tests/config and README; eight assets and
credits; the shared Pioneer journal entry, two metadata/route test expectations,
trusted catalog migration and required AGENTS status note. No other chapter source
or home page files were modified.
