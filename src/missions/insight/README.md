# InSight — The Machine That Listened to Mars

Seven connected scenes loaded through the existing package loader. Scene 03
is the seismometer deployment simulation, Scene 04 is Seismic Signal Detective,
Scene 05 is Mars Interior Discovery, and Scene 06 is the dust and solar-power
model. Imagery and the hosted catalog are still unfinished, so the chapter is
not release-ready.

Open Mission Control, then InSight, then start the mission. Guest progress uses
the existing tab-local services. This package does not call Supabase or award
XP itself.

| Scene id | Kind | Interaction | Platform outcome |
| --- | --- | --- | --- |
| `insight-last-signal` | story | Open the mission archive | No XP |
| `insight-arrival` | story | Open any three of four instrument records | `introduction`: 20 XP |
| `insight-deployment` | activity | Seismometer deployment simulation | No XP |
| `insight-first-whisper` | activity | Seismic Signal Detective | `activity`: 40 XP |
| `insight-interior` | discovery | Mars Interior Discovery | `discovery`: 25 XP; `insight-notes` |
| `insight-fading-power` | activity | Dust and solar-power model | No XP |
| `insight-legacy` | ending | Continue | Completion and `legacy`: 15 XP; `insight-story` |

Scene ids are the checkpoint ids. Keep them stable for the later catalog migration.

## Activities

`activities/SeismometerDeployment.tsx` is the Scene 03 simulation. The learner
examines three practice patches, chooses the flat clear ground, activates the
arm, and places the wind and thermal shield. The patches are not real NASA
site options, and the motion is not telemetry.

`activities/DustPowerSimulation.tsx` is the Scene 06 model. A dust slider
changes the drawn sunlight and a qualitative energy indicator. NASA’s
5,000 and 500 watt-hour figures appear only in the explanation after the
learner raises the dust. Those figures are NASA measurements, not slider output.

`activities/MarsInteriorDiscovery.tsx` is the Scene 05 discovery interaction. The cross-section is a schematic, not a NASA measurement. The optional mole note uses NASA’s description of HP3.

`activities/SeismicSignalDetective.tsx` is the Scene 04 activity. The three waveforms are educational drawings. The optional file `public/assets/missions/insight/first-likely-marsquake.wav` is NASA’s sped-up sol 128 recording (NASA/JPL-Caltech/CNES/IPGP/Imperial College London). The activity can be finished without playing it.

`activities/StorySteps.tsx` is the real archive opener and instrument cards for
this foundation. Instrument positions are not shown; the cards are records, not
a lander diagram.

## Not in this step

- The journal entry `insight-notes` still uses the shared placeholder title and
  summary. The achievement title is still “InSight story”.
- Hosted `mission_scene_catalog` has no InSight scene rows, so an account
  checkpoint can fail until a later catalog migration.
- `cover.svg` is still a generated placeholder, not a NASA photograph.

## NASA sources

Checked 2026-11-15. Facts in the scenes come from the records in `mission.ts`.

- [InSight overview](https://science.nasa.gov/mission/insight/): November 26, 2018 landing on Elysium Planitia, arm length, and December 15, 2022 end-of-mission date.
- [Science instruments](https://science.nasa.gov/mission/insight/science-instruments/): SEIS, the wind and thermal shield, HP3, and RISE.
- [First likely marsquake](https://science.nasa.gov/resource/first-likely-marsquake-heard-by-nasas-insight/): April 6, 2019, sol 128, and the wind, quake, and arm vibrations in that recording.
- [Inner layers](https://science.nasa.gov/resource/how-insight-studies-mars-inner-layers/): crust, mantle, core, and how seismic signals change in different materials.
- [Power generation](https://science.nasa.gov/resource/insights-power-generation-after-landing-and-spring-2022/): about 5,000 watt-hours per sol after landing, and about 500 by spring 2022.
- [Mission retirement](https://www.nasa.gov/missions/insight/nasa-retires-insight-mars-lander-mission-after-years-of-science/): last contact on December 15, 2022, the December 21 conclusion, 1,319 marsquakes, and the mole’s depth limits.

No generated science measurements are shown. The two power values and the quake
count are NASA figures. The deployment drawing and the dust slider are labeled
educational simulations.
