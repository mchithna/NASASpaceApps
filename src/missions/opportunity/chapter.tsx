import {
  createActivityRegistry,
  defineActivity,
} from '@/engine/activityRegistry.ts'
import type { EngineScene } from '@/engine/scenes.ts'
import type { MissionChapter } from '@/missions/chapter.ts'
import {
  Opening,
  ExploreRover,
  WaterDetective,
  MarsExpedition,
} from './activities/Exploration.tsx'
import {
  DustStormSimulator,
  EvidenceMatch,
  JourneyTimeline,
} from './activities/ScienceActivities.tsx'
import { panorama } from './content.ts'

const overview = ['opportunity-nasa-science']
const science = ['opportunity-science-highlights']
const end = ['opportunity-mission-end']

export const scenes: readonly EngineScene[] = [
  {
    id: 'last-signal',
    kind: 'story',
    title: 'The Day Mars Went Silent',
    narration: 'factual',
    sourceIds: end,
    reward: null,
    media: panorama,
    body: 'June 2018. A vast dust storm darkens the sky over Perseverance Valley. Opportunity stops answering Earth. Designed for 90 Martian days, it had explored for almost 15 years. How did its journey last so long?',
    interaction: {
      activityId: 'begin-investigation',
      activityType: 'opportunity-opening',
      config: {},
    },
  },
  {
    id: 'meet-opportunity',
    kind: 'story',
    title: 'Meet Opportunity',
    narration: 'factual',
    sourceIds: [
      ...overview,
      'opportunity-instruments',
      'opportunity-six-things',
    ],
    reward: 'introduction',
    body: 'Rewind to January 2004. Opportunity lands inside Eagle Crater in Meridiani Planum. Its twin, Spirit, has landed elsewhere on Mars. Their task: investigate rocks and soil for geological clues to past water. The primary mission was just 90 sols — Martian days.',
    interaction: {
      activityId: 'rover-equipment',
      activityType: 'opportunity-equipment',
      config: {},
    },
  },
  {
    id: 'water-clues',
    kind: 'evidence',
    title: 'Was Mars Once Wet?',
    narration: 'factual',
    sourceIds: science,
    reward: null,
    body: 'Eagle Crater offered an extraordinary first laboratory. Small hematite-rich spheres and sedimentary rock layers held clues to Mars’s ancient environments. A mineral is a natural solid with a particular chemical makeup; its formation can reveal the conditions around it.',
    interaction: {
      activityId: 'water-detective',
      activityType: 'opportunity-water',
      config: {},
    },
  },
  {
    id: 'mars-expedition',
    kind: 'activity',
    title: 'The Journey Beyond Expectations',
    narration: 'factual',
    sourceIds: [...overview, 'opportunity-traverse', ...science],
    reward: 'activity',
    instruction:
      'Follow four stops in historical order. At each location, examine a scientific target to unlock the next destination. Review earlier evidence at any time.',
    activityId: 'expedition',
    activityType: 'opportunity-expedition',
    config: {},
  },
  {
    id: 'endeavour-evidence',
    kind: 'discovery',
    title: 'More Evidence, More Questions',
    narration: 'factual',
    sourceIds: science,
    reward: 'discovery',
    discoveryId: 'opportunity-notes',
    media: {
      src: '/assets/missions/opportunity/gypsum-vein.jpg',
      alt: 'A pale mineral vein called Homestake cuts through rocks near Endeavour Crater.',
      credit: 'NASA/JPL-Caltech/Cornell/ASU · PIA15033. Pancam color view.',
    },
    body: 'Near Endeavour’s rim, gypsum veins marked minerals left by water moving through fractures. Clay-bearing rocks pointed to an ancient watery environment less acidic than some earlier sites. Less acidic water matters when considering conditions that could support microbes — tiny living things. Habitable does not mean inhabited.',
    interaction: {
      activityId: 'match-evidence',
      activityType: 'opportunity-match',
      config: {},
    },
  },
  {
    id: 'dust-storm',
    kind: 'activity',
    title: 'When the Sunlight Disappeared',
    narration: 'factual',
    sourceIds: [...end, 'opportunity-six-things'],
    reward: null,
    framing: 'simulation',
    instruction:
      'Return to June 2018. Explore how airborne dust reduces sunlight reaching a solar-powered rover.',
    activityId: 'solar-dust',
    activityType: 'opportunity-dust',
    config: {},
  },
  {
    id: 'opportunity-legacy',
    kind: 'ending',
    title: "The Explorer That Wouldn't Stop",
    narration: 'factual',
    sourceIds: ['opportunity-final-panorama', 'opportunity-traverse', ...end],
    reward: null,
    media: panorama,
    body: 'Nearly 15 years of exploration. A journey of 45.16 kilometres. Geological evidence of ancient water and changing environments. Opportunity remains on Mars, while its science and engineering lessons guide future exploration. Its journey ended; its discoveries continue to shape our understanding of the Red Planet.',
    instruction:
      'Rebuild the journey to record completion and unlock Martian Trailblazer. The four milestones total up to 100 XP: introduction 20, expedition 40, discovery 25 and legacy 15. Use Exit mission to return to Mission Control, or Start again to replay without duplicate rewards.',
    interaction: {
      activityId: 'rebuild-journey',
      activityType: 'opportunity-timeline',
      config: {},
    },
  },
]

const registry = createActivityRegistry([
  defineActivity('opportunity-opening', (props) => <Opening {...props} />),
  defineActivity('opportunity-equipment', (props) => (
    <ExploreRover {...props} />
  )),
  defineActivity('opportunity-water', (props) => <WaterDetective {...props} />),
  defineActivity('opportunity-expedition', (props) => (
    <MarsExpedition {...props} />
  )),
  defineActivity('opportunity-match', (props) => <EvidenceMatch {...props} />),
  defineActivity('opportunity-dust', (props) => (
    <DustStormSimulator {...props} />
  )),
  defineActivity('opportunity-timeline', (props) => (
    <JourneyTimeline {...props} />
  )),
])
if (!registry.ok) throw new Error('Invalid Opportunity activity registry.')
export const chapter = {
  scenes,
  activities: registry.value,
} satisfies MissionChapter
