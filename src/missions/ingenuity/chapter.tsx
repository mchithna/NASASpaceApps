import {
  createActivityRegistry,
  defineActivity,
} from '@/engine/activityRegistry.ts'
import type { EngineScene } from '@/engine/scenes.ts'
import type { MissionChapter } from '@/missions/chapter.ts'
import {
  Opening,
  ComponentExplorer,
  MarsFlightLab,
} from './activities/FlightTraining.tsx'
import { FirstFlightSimulator } from './activities/FirstFlightSimulator.tsx'
import {
  AerialScout,
  Flight72Investigation,
  LegacyTimeline,
} from './activities/Exploration.tsx'
import { helicopterPhoto } from './content.ts'

export const scenes: readonly EngineScene[] = [
  {
    id: 'mars-flight-dream',
    kind: 'story',
    title: 'What If We Could Fly on Mars?',
    narration: 'factual',
    sourceIds: [
      'ingenuity-nasa-science',
      'ingenuity-first-flight',
      'ingenuity-surface-image',
    ],
    reward: null,
    body: 'On Earth, helicopters push against dense air. On Mars, the atmosphere is so thin that flight demands extraordinary engineering. Ingenuity arrived with Perseverance on February 18, 2021. NASA hoped for up to five test flights. Seventy-two would become its legacy.',
    interaction: {
      activityId: 'begin-training',
      activityType: 'ingenuity-opening',
      config: {},
    },
  },
  {
    id: 'aircraft-inspection',
    kind: 'story',
    title: 'Meet the Little Helicopter That Could',
    narration: 'factual',
    sourceIds: ['ingenuity-hardware'],
    reward: 'introduction',
    body: 'Lightweight construction, two counter-rotating rotors and four blades helped Ingenuity fly in thin air. Solar charging kept its batteries ready. A navigation camera and onboard computer helped it follow flight plans without a pilot steering from Earth.',
    instruction: 'Inspect at least four aircraft components.',
    interaction: {
      activityId: 'inspect-aircraft',
      activityType: 'ingenuity-components',
      config: {},
    },
  },
  {
    id: 'flight-science',
    kind: 'activity',
    title: 'Can a Helicopter Fly in the Thin Martian Air?',
    narration: 'factual',
    sourceIds: [
      'ingenuity-hardware',
      'ingenuity-first-flight',
      'ingenuity-atmosphere',
    ],
    reward: null,
    framing: 'simulation',
    instruction:
      'Mars’s lower gravity helps, but its thin atmosphere makes lift difficult. Explore why a specially designed rotor system mattered.',
    activityId: 'flight-lab',
    activityType: 'ingenuity-lab',
    config: {},
  },
  {
    id: 'first-flight',
    kind: 'activity',
    title: 'Mission Control: Ready for Takeoff',
    narration: 'factual',
    sourceIds: ['ingenuity-first-flight', 'ingenuity-first-video'],
    reward: 'activity',
    framing: 'simulation',
    instruction:
      'April 19, 2021. Prepare a simplified flight plan, then authorize an autonomous demonstration. Earth–Mars communication delays ruled out real-time joystick piloting.',
    activityId: 'authorize-flight',
    activityType: 'ingenuity-flight',
    config: {},
  },
  {
    id: 'aerial-scouting',
    kind: 'activity',
    title: 'The Sky Was No Longer the Limit',
    narration: 'factual',
    sourceIds: [
      'ingenuity-nasa-science',
      'ingenuity-investigation',
      'ingenuity-surface-image',
      'ingenuity-sand-image',
    ],
    reward: null,
    framing: 'hypothetical',
    instruction:
      'Five planned flights grew into 72. Ingenuity became an aerial scout, demonstrating how flight could support exploration. Design a hypothetical scouting plan; this map does not reproduce a historical flight.',
    activityId: 'scout-route',
    activityType: 'ingenuity-scout',
    config: {},
  },
  {
    id: 'flight-seventy-two',
    kind: 'discovery',
    title: 'What Happened to Flight 72?',
    narration: 'factual',
    sourceIds: [
      'ingenuity-investigation',
      'ingenuity-damage-image',
      'ingenuity-hard-landing',
    ],
    reward: 'discovery',
    discoveryId: 'ingenuity-notes',
    body: 'January 18, 2024: Ingenuity’s final flight ended with a hard landing and rotor damage. NASA’s later investigation identified insufficient visual-navigation information over relatively featureless terrain as the likely start of the accident sequence. Examine the evidence, while keeping that uncertainty in mind.',
    interaction: {
      activityId: 'investigate-flight',
      activityType: 'ingenuity-investigation',
      config: {},
    },
  },
  {
    id: 'ingenuity-legacy',
    kind: 'ending',
    title: 'Five Flights Became Seventy-Two',
    narration: 'factual',
    sourceIds: [
      'ingenuity-nasa-science',
      'ingenuity-mission-end',
      'ingenuity-investigation',
      'ingenuity-surface-image',
    ],
    reward: null,
    media: helicopterPhoto,
    body: 'Ingenuity began as an experiment. Its first flight proved powered, controlled flight on another planet was possible. After 72 flights, damaged blades ended its flying journey. Its engineering lessons will help guide future aircraft into the skies of other worlds.',
    instruction:
      'Rebuild the legacy timeline. On confirmed completion, the shared platform records up to 100 XP and the existing Ingenuity achievement. Exit mission returns to Mission Control; Start again replays without duplicate rewards.',
    interaction: {
      activityId: 'legacy-timeline',
      activityType: 'ingenuity-timeline',
      config: {},
    },
  },
]

const registry = createActivityRegistry([
  defineActivity('ingenuity-opening', (props) => <Opening {...props} />),
  defineActivity('ingenuity-components', (props) => (
    <ComponentExplorer {...props} />
  )),
  defineActivity('ingenuity-lab', (props) => <MarsFlightLab {...props} />),
  defineActivity('ingenuity-flight', (props) => (
    <FirstFlightSimulator {...props} />
  )),
  defineActivity('ingenuity-scout', (props) => <AerialScout {...props} />),
  defineActivity('ingenuity-investigation', (props) => (
    <Flight72Investigation {...props} />
  )),
  defineActivity('ingenuity-timeline', (props) => (
    <LegacyTimeline {...props} />
  )),
])
if (!registry.ok) throw new Error('Invalid Ingenuity activity registry.')
export const chapter = {
  scenes,
  activities: registry.value,
} satisfies MissionChapter
