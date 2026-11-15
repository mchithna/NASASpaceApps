# InSight — The Machine That Listened to Mars

A lander that never drove listened to Mars for more than four years. Seven
scenes load through the existing package loader. Guest progress uses the
tab-local services. This package does not call Supabase or award XP itself.

Guests read the journal title “Mars Has a Hidden Structure” and the achievement
“Planetary Detective” from the shared catalog. The ids stay `insight-notes` and
`insight-story`. Registered accounts read the same journal text from
`mission_scene_catalog` after `20261115171000_insight_chapter.sql` is applied.
That migration is local only until it is approved for the hosted database.
`cover.svg` is still a generated placeholder, not a NASA photograph.

## Scenes

| Scene id | Kind | What the learner does | Platform outcome |
| --- | --- | --- | --- |
| `insight-last-signal` | story | Open the archive | No XP |
| `insight-arrival` | story | Open any three of four instrument records | `introduction`: 20 XP |
| `insight-deployment` | activity | Practice simulation, then the real placement photo | No XP |
| `insight-first-whisper` | activity | Seismic Signal Detective | `activity`: 40 XP |
| `insight-interior` | discovery | Mars Interior Discovery | `discovery`: 25 XP; `insight-notes` |
| `insight-fading-power` | activity | Qualitative dust model | No XP |
| `insight-legacy` | ending | Continue | Completion and `legacy`: 15 XP from `completeMission`; `insight-story` displays as Planetary Detective |

Scene ids are the checkpoint ids.

## Activities

- **Archive and instruments** (`StorySteps.tsx`): SEIS, HP3, RISE, and the solar panels. RISE is radio tracking of the lander’s position. The instruments page repeats the heat-probe sentence under RISE; this chapter does not.
- **Seismometer deployment** (`SeismometerDeployment.tsx`): three practice patches, then the arm and the wind and thermal shield. The patches are not real NASA site choices, and the motion is not telemetry. The scene photograph is the real December 19, 2018 placement, before the shield.
- **Seismic Signal Detective** (`SeismicSignalDetective.tsx`): three educational waveforms. The optional file `first-likely-marsquake.wav` is NASA’s April 6, 2019, sol 128 recording, sped up 60 times. It mixes wind, the seismic signal, and the robotic arm. The activity can be finished without playing it.
- **Mars Interior Discovery** (`MarsInteriorDiscovery.tsx`): three clues reveal a schematic. That drawing is not to scale and is not a NASA measurement. NASA’s own illustrated cutaway is the scene photograph.
- **Dust and solar power** (`DustPowerSimulation.tsx`): a slider changes drawn sunlight and a qualitative energy indicator. It does not calculate watt-hours.

Shared styling is `activities/InsightObservatory.module.css`: navy panels, cyan signals, Martian orange ground, and a gold border on completion notes. Reduced motion turns the transitions off.

## NASA sources

Checked 2026-11-15.

- [InSight overview](https://science.nasa.gov/mission/insight/): landing November 26, 2018, on Elysium Planitia; arm longer than 5 feet 9 inches (1.8 meters); end of mission listed as December 15, 2022.
- [Science instruments](https://science.nasa.gov/mission/insight/science-instruments/): SEIS, the wind and thermal shield, HP3, and RISE.
- [First selfie](https://science.nasa.gov/resource/insights-first-selfie/): December 6, 2018, sol 10.
- [SEIS deployed](https://science.nasa.gov/resource/seis-deployed-on-mars/): December 19, 2018.
- [First likely marsquake](https://science.nasa.gov/resource/first-likely-marsquake-heard-by-nasas-insight/): April 6, 2019, sol 128.
- [InSight at work](https://science.nasa.gov/resource/listen-to-nasas-insight-at-work-on-mars/): wind, arm motion, and instrument noise are separate from a marsquake. Not used as a scene photograph.
- [Inner layers](https://science.nasa.gov/resource/how-insight-studies-mars-inner-layers/): crust, mantle, core, and how seismic signals change.
- [Power generation](https://science.nasa.gov/resource/insights-power-generation-after-landing-and-spring-2022/): about 5,000 watt-hours per sol after landing, and about 500 by spring 2022.
- [Final selfie](https://science.nasa.gov/resource/insights-final-selfie/): April 24, 2022, sol 1,211.
- [One of the last images](https://science.nasa.gov/resource/one-of-insights-last-images/): December 11, 2022, sol 1,436.
- [Mission retirement](https://www.nasa.gov/missions/insight/nasa-retires-insight-mars-lander-mission-after-years-of-science/): last contact December 15, 2022; conclusion announced December 21, 2022; 1,319 marsquakes; the mole’s depth limits.

## Asset credits

Files live in `public/assets/missions/insight/`. Provenance is in `media.json`.

| File | Credit | What it shows |
| --- | --- | --- |
| `last-seismometer.jpg` | NASA/JPL-Caltech · PIA25680 | Seismometer dome, December 11, 2022 |
| `first-selfie.jpg` | NASA/JPL-Caltech · PIA22876 | First full selfie, December 6, 2018 |
| `seis-on-mars.jpg` | NASA/JPL-Caltech · PIA22956 | Arm placing SEIS, December 19, 2018 |
| `panel-dust.jpg` | NASA/JPL-Caltech · PIA25284 | Power chart. Right photo is March–April 2019 |
| `interior-layers.jpg` | NASA/JPL-Caltech · PIA25282 | Illustrated cutaway, not a scale measurement |
| `final-selfie.jpg` | NASA/JPL-Caltech · PIA25287 | Final selfie, April 24, 2022 |
| `first-likely-marsquake.wav` | NASA/JPL-Caltech/CNES/IPGP/Imperial College London | Sol 128 recording, sped up 60 times |

The PIA25284 chart labels the 2019 photograph “Now.” The visible caption states that the photograph is from 2019 and that the 500 watt-hour bar is NASA’s spring 2022 measurement.

## Simulations

The deployment patches, the three waveforms, the interior schematic, and the dust slider are educational models. They are labeled in the scene. Illustrative slider readings are not NASA measurements. The quake count, the two watt-hour figures, the dates, and the instrument depths above are NASA figures.

## Verification

Checked 2026-11-15 in the local guest session. The dev server reported that Supabase credentials were not configured, so progress used the in-memory mock. Hosted checkpoint saving was not exercised.

- Mission Control opened InSight. The seven scenes played in order: archive, three instrument records, seismometer deployment, signal investigation, interior discovery, dust model, and ending Continue.
- Leaving during scene 3 saved checkpoint `insight-deployment` with 20 XP. A full reload kept that place, and Continue Mission returned to the deployment scene.
- Completion unlocked Planetary Detective, raised the total to 100 XP, and marked InSight completed. The journal showed “Mars Has a Hidden Structure” with the sourced summary.
- Replay walked the seven scenes with Next. Continue stayed disabled, and the total stayed at 100 XP with one discovery.
- `npm run typecheck` and `npm run build` passed. The targeted chapter and reward-contract tests passed. The full repository suite was not rerun.
