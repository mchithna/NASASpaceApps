import {
  createActivityRegistry,
  defineActivity,
} from '@/engine/activityRegistry.ts'
import type { EngineScene } from '@/engine/scenes.ts'
import type { MissionChapter } from '@/missions/chapter.ts'
import {
  Opening,
  SpacecraftExplorer,
  AsteroidBeltJourney,
} from './activities/Departure.tsx'
import { JupiterFlyby } from './activities/JupiterFlyby.tsx'
import {
  PlaqueDecoder,
  DeepSpaceSignalLab,
  LegacyTimeline,
} from './activities/MessageAndSignal.tsx'

export const scenes: readonly EngineScene[] = [
  {
    id: 'last-whisper',
    kind: 'story',
    title: 'The Last Whisper From Deep Space',
    narration: 'factual',
    sourceIds: ['pioneer-10-last-signal', 'pioneer-10-history'],
    reward: null,
    body: 'January 23, 2003. More than thirty years after launch, Earth detects a final, very weak signal from Pioneer 10. No scientific telemetry can be recovered. How did a spacecraft designed for about 21 months keep exploring for decades?',
    interaction: {
      activityId: 'trace-signal',
      activityType: 'pioneer-opening',
      config: {},
    },
  },
  {
    id: 'meet-pioneer',
    kind: 'story',
    title: 'Meet Pioneer 10',
    narration: 'factual',
    sourceIds: ['pioneer-10-nasa-science', 'pioneer-10-launch'],
    reward: 'introduction',
    body: 'Rewind to March 2, 1972. Pioneer 10 leaves Earth to investigate Jupiter and interplanetary space. A high-gain antenna links it to home. Radioisotope generators provide electricity far from the Sun. Scientific instruments are ready for unexplored surroundings.',
    instruction:
      'Inspect at least four spacecraft systems. This is an educational reconstruction, not control of the actual probe.',
    interaction: {
      activityId: 'inspect-systems',
      activityType: 'pioneer-spacecraft',
      config: {},
    },
  },
  {
    id: 'asteroid-belt',
    kind: 'activity',
    title: 'Into Uncharted Territory',
    narration: 'factual',
    sourceIds: ['pioneer-10-launch', 'pioneer-10-belt'],
    framing: 'simulation',
    reward: null,
    instruction:
      'Pioneer 10 became the first spacecraft to cross the main asteroid belt. Rebuild its outward journey, then investigate what a safe crossing teaches us about this mostly empty region.',
    activityId: 'belt-journey',
    activityType: 'pioneer-belt',
    config: {},
  },
  {
    id: 'jupiter-encounter',
    kind: 'activity',
    title: 'Jupiter: A Giant Revealed',
    narration: 'factual',
    sourceIds: [
      'pioneer-10-nasa-science',
      'pioneer-10-jupiter',
      'pioneer-10-history',
    ],
    framing: 'simulation',
    reward: 'activity',
    instruction:
      'December 4, 1973, UTC. Pioneer 10 makes the first close flyby of Jupiter. Investigate magnetic fields, radiation and atmospheric images using the instruments that made these observations possible.',
    activityId: 'jupiter-science',
    activityType: 'pioneer-jupiter',
    config: {},
  },
  {
    id: 'pioneer-plaque',
    kind: 'discovery',
    title: 'A Message From Humanity',
    narration: 'factual',
    sourceIds: ['pioneer-10-plaque', 'pioneer-10-symbols', 'pioneer-10-launch'],
    reward: 'discovery',
    discoveryId: 'pioneer-10-notes',
    body: 'Attached to the spacecraft is a small metal plaque. Its designers used images and scientific reference points to describe humanity and our origin, in case another intelligence finds the spacecraft in the distant future. It is a physical message, not a radio transmission.',
    interaction: {
      activityId: 'decode-plaque',
      activityType: 'pioneer-plaque',
      config: {},
    },
  },
  {
    id: 'deep-space-signal',
    kind: 'activity',
    title: 'The Faintest Voice Across the Stars',
    narration: 'factual',
    sourceIds: [
      'pioneer-10-last-signal',
      'pioneer-10-nasa-science',
      'pioneer-10-history',
      'pioneer-10-dsn',
      'pioneer-10-dsn-image',
      'pioneer-10-earth-image',
    ],
    reward: null,
    framing: 'simulation',
    instruction:
      'Radio travels at the speed of light, but deep space is enormous. Explore distance and power as separate communication challenges, then review the final detected signal.',
    activityId: 'communication-lab',
    activityType: 'pioneer-signal',
    config: {},
  },
  {
    id: 'pioneer-legacy',
    kind: 'ending',
    title: 'The Messenger That Never Came Home',
    narration: 'factual',
    sourceIds: [
      'pioneer-10-nasa-science',
      'pioneer-10-launch',
      'pioneer-10-last-signal',
      'pioneer-10-plaque',
    ],
    reward: null,
    body: 'A first crossing of the main asteroid belt. A first close look at Jupiter. Knowledge that helped later explorers. A message from humanity carried outward. Pioneer 10 was never meant to return to Earth. We can no longer hear it, but the discoveries it sent home continue to matter.',
    interaction: {
      activityId: 'rebuild-legacy',
      activityType: 'pioneer-timeline',
      config: {},
    },
  },
]
const registry = createActivityRegistry([
  defineActivity('pioneer-opening', (props) => <Opening {...props} />),
  defineActivity('pioneer-spacecraft', (props) => (
    <SpacecraftExplorer {...props} />
  )),
  defineActivity('pioneer-belt', (props) => <AsteroidBeltJourney {...props} />),
  defineActivity('pioneer-jupiter', (props) => <JupiterFlyby {...props} />),
  defineActivity('pioneer-plaque', (props) => <PlaqueDecoder {...props} />),
  defineActivity('pioneer-signal', (props) => (
    <DeepSpaceSignalLab {...props} />
  )),
  defineActivity('pioneer-timeline', (props) => <LegacyTimeline {...props} />),
])
if (!registry.ok) throw new Error('Invalid Pioneer 10 activity registry.')
export const chapter = {
  scenes,
  activities: registry.value,
} satisfies MissionChapter
