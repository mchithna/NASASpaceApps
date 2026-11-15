import {
  createActivityRegistry,
  defineActivity,
} from '@/engine/activityRegistry.ts'
import type { EngineScene } from '@/engine/scenes.ts'
import type { MissionChapter } from '@/missions/chapter.ts'
import { DustPowerSimulation } from './activities/DustPowerSimulation.tsx'
import { MarsInteriorDiscovery } from './activities/MarsInteriorDiscovery.tsx'
import { SeismicSignalDetective } from './activities/SeismicSignalDetective.tsx'
import { SeismometerDeployment } from './activities/SeismometerDeployment.tsx'
import { InstrumentCards, OpenArchive } from './activities/StorySteps.tsx'

const missionPage = ['insight-nasa-science']
const instruments = ['insight-instruments']
const retirement = ['insight-retirement']

export const scenes: readonly EngineScene[] = [
  {
    id: 'insight-last-signal',
    kind: 'story',
    title: 'The Last Signal',
    narration: 'mixed',
    sourceIds: [...missionPage, ...retirement],
    reward: null,
    body: 'December 15, 2022. The last signal from InSight reaches Earth from Elysium Planitia. On December 21, NASA concludes that the lander’s solar-powered batteries have run out. Dust covers a spacecraft that never drove. For more than four years it stayed in one place and listened to the ground. What did those vibrations reveal beneath Mars?',
    instruction:
      'Open the recovered mission archive. This starts the investigation.',
    interaction: {
      activityId: 'open-archive',
      activityType: 'insight-archive',
      config: {},
    },
  },
  {
    id: 'insight-arrival',
    kind: 'story',
    title: 'A Scientist Arrives on Mars',
    narration: 'mixed',
    sourceIds: [...missionPage, ...instruments, 'insight-power'],
    reward: 'introduction',
    body: 'Rewind to November 26, 2018. InSight lands on Elysium Planitia, a flat plain chosen because the science target was underground, not a scenic surface. The lander stays put. From one spot it can still take a planet’s pulse, look for heat flowing outward, and track how Mars wobbles as it spins.',
    instruction:
      'Inspect at least three instruments, including the tools that listen, measure heat, track the core, and collect sunlight.',
    interaction: {
      activityId: 'inspect-instruments',
      activityType: 'insight-instruments',
      config: {},
    },
  },
  {
    id: 'insight-deployment',
    kind: 'activity',
    title: "Setting Up Mars's Ears",
    narration: 'factual',
    sourceIds: [...missionPage, ...instruments],
    reward: null,
    instruction:
      'Examine three practice patches, choose the flat clear ground, then activate the arm and place the wind and thermal shield. This is a simulation, not a record of the real placement.',
    activityId: 'seismometer-deployment',
    activityType: 'insight-deployment',
    config: {},
  },
  {
    id: 'insight-first-whisper',
    kind: 'activity',
    title: 'The First Whisper',
    narration: 'factual',
    sourceIds: ['insight-first-quake'],
    reward: 'activity',
    instruction:
      'Examine three educational signals and decide which clue best fits a marsquake. The drawings are not NASA measurements. The optional recording is not required.',
    activityId: 'signal-detective',
    activityType: 'insight-signal-detective',
    config: {},
  },
  {
    id: 'insight-interior',
    kind: 'discovery',
    title: 'Seeing the Invisible Planet',
    narration: 'mixed',
    sourceIds: ['insight-interior', ...instruments, ...retirement],
    reward: 'discovery',
    discoveryId: 'insight-notes',
    body: 'Seismic signals change as they pass through different materials. Scientists read those records to study Mars’s crust, mantle, and core. Most marsquakes come from heat and pressure that crack rock. Meteorite impacts are another source. The waves travel through the planet, so nobody has to dig to the core to investigate it.',
    instruction:
      'Interpret three seismic clues to reveal a schematic interior. The drawing is not to scale and is not a NASA measurement.',
    interaction: {
      activityId: 'interior-discovery',
      activityType: 'insight-interior',
      config: {},
    },
  },
  {
    id: 'insight-fading-power',
    kind: 'activity',
    title: 'When the Power Faded',
    narration: 'factual',
    sourceIds: ['insight-power', ...retirement],
    reward: null,
    instruction:
      'Raise the dust on this educational model and watch the sunlight and energy indicator change. The slider is not a NASA measurement.',
    activityId: 'dust-power',
    activityType: 'insight-dust-power',
    config: {},
  },
  {
    id: 'insight-legacy',
    kind: 'ending',
    title: 'Mars Was Never Truly Silent',
    narration: 'mixed',
    sourceIds: [...retirement, 'insight-interior'],
    reward: null,
    body: 'Return to December 2022. The lander had stopped answering, but the ground had not been quiet. SEIS detected 1,319 marsquakes, including some from meteoroid impacts. Those records helped scientists study the crust, mantle, and core. A machine that never drove changed what we know about the inside of Mars. The mission ended. The listening did not.',
    instruction:
      'Select Continue to save chapter completion. Replaying does not add duplicate rewards.',
  },
]

const registry = createActivityRegistry([
  defineActivity('insight-archive', (props) => <OpenArchive {...props} />),
  defineActivity('insight-instruments', (props) => (
    <InstrumentCards {...props} />
  )),
  defineActivity('insight-deployment', (props) => (
    <SeismometerDeployment {...props} />
  )),
  defineActivity('insight-signal-detective', (props) => (
    <SeismicSignalDetective {...props} />
  )),
  defineActivity('insight-interior', (props) => (
    <MarsInteriorDiscovery {...props} />
  )),
  defineActivity('insight-dust-power', (props) => (
    <DustPowerSimulation {...props} />
  )),
])
if (!registry.ok) throw new Error('Invalid InSight activity registry.')

export const chapter = {
  scenes,
  activities: registry.value,
} satisfies MissionChapter
