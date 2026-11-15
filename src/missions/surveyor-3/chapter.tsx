import {
  createActivityRegistry,
  defineActivity,
} from '@/engine/activityRegistry.ts'
import type { MissionChapter } from '@/missions/chapter.ts'
import type { EngineScene } from '@/engine/scenes.ts'
import { validateEventOrderPrompt } from '@/engine/activities/validatePrompt.ts'
import { EquipmentInvestigation } from './activities/EquipmentInvestigation.tsx'
import { LandingSequence } from './activities/LandingSequence.tsx'
import { SoilInvestigation } from './activities/SoilInvestigation.tsx'
import { ApolloEvidence } from './activities/ApolloEvidence.tsx'

const science = ['surveyor-3-nasa-science']
const history = ['surveyor-3-apollo-history']
const reunionPhoto = {
  src: '/assets/missions/surveyor-3/apollo-12-visit.jpg',
  alt: 'Pete Conrad beside Surveyor 3, with the Apollo 12 Lunar Module in the distance.',
  credit: 'NASA / Apollo 12 crew · AS12-48-7133. Historical photograph.',
}

export const scenes: readonly EngineScene[] = [
  {
    id: 'surveyor-mystery',
    kind: 'story',
    title: 'The Robot They Came Back For',
    narration: 'factual',
    sourceIds: history,
    reward: null,
    media: reunionPhoto,
    body: 'November 1969. Apollo 12 astronauts Pete Conrad and Alan Bean visit a silent robotic scout on the Moon. Surveyor 3 has been there since 1967.',
    instruction:
      'Academy investigation: Why return to a machine that no longer answers? Select Continue to investigate the mystery.',
  },
  {
    id: 'surveyor-introduction',
    kind: 'story',
    title: 'Meet Surveyor 3',
    narration: 'factual',
    sourceIds: ['surveyor-3-jpl', 'surveyor-3-systems'],
    reward: 'introduction',
    body: 'Rewind to 1967. Surveyor 3 studied lunar ground before astronauts arrived. Its camera and sampler helped investigate whether an Apollo Lunar Module could land safely.',
    interaction: {
      activityId: 'equipment',
      activityType: 'surveyor-equipment',
      config: {},
    },
  },
  {
    id: 'surveyor-landing',
    kind: 'activity',
    title: 'Three Touchdowns, One Landing',
    narration: 'factual',
    sourceIds: science,
    reward: null,
    instruction:
      'Reflective rocks confused the descent radar. The engines did not stop at the intended moment, and Surveyor 3 bounced twice before settling. Reconstruct the sequence.',
    activityId: 'landing-sequence',
    activityType: 'surveyor-sequence',
    config: {},
    prompt: {
      type: 'event-order',
      instruction: 'Use Up and Down to put the four events in order.',
      steps: [
        { id: 'descent', label: 'Descent toward the Moon' },
        { id: 'first-bounce', label: 'First touchdown and bounce' },
        { id: 'second-bounce', label: 'Second touchdown and bounce' },
        { id: 'settle', label: 'Final landing in the crater' },
      ],
      correctOrder: ['descent', 'first-bounce', 'second-bounce', 'settle'],
      initialOrder: ['second-bounce', 'descent', 'settle', 'first-bounce'],
      explanation:
        'The lander descended, bounced on its first two touchdowns, then settled. An unexpected landing did not prevent useful science.',
    },
  },
  {
    id: 'surveyor-soil',
    kind: 'activity',
    title: 'The Lunar Soil Investigation',
    narration: 'factual',
    sourceIds: ['surveyor-3-jpl', ...science],
    framing: 'simulation',
    reward: 'activity',
    instruction:
      'Operate the simplified sampler and interpret the evidence. The real probe dug four trenches and performed four bearing tests and thirteen impact tests.',
    activityId: 'soil-investigation',
    activityType: 'surveyor-soil',
    config: {},
  },
  {
    id: 'surveyor-silence',
    kind: 'evidence',
    title: 'The Last Transmission',
    narration: 'factual',
    sourceIds: ['surveyor-3-footpads'],
    reward: null,
    body: 'April 20, 1967: Surveyor 3 lands. May 4, 1967: controllers make their last contact, after lunar night has begun. The solar-powered spacecraft is in darkness. It does not resume its work. November 1969: Apollo 12 arrives nearby.',
    instruction:
      'Follow the timeline: scientific work → last contact → a later visit. Silence ended communication, but the equipment still held evidence.',
  },
  {
    id: 'surveyor-apollo',
    kind: 'discovery',
    title: 'Apollo 12 Returns',
    narration: 'factual',
    sourceIds: history,
    reward: 'discovery',
    media: reunionPhoto,
    discoveryId: 'surveyor-3-notes',
    body: 'Conrad and Bean examined Surveyor 3 during their second moonwalk. They removed its camera, scoop, and other parts for return to Earth. Engineers could then investigate how hardware had weathered the lunar environment.',
    instruction:
      'Examine the photograph, then identify two recovered components. Completing this investigation records the discovery through your player services.',
    interaction: {
      activityId: 'apollo-evidence',
      activityType: 'surveyor-apollo',
      config: {},
    },
  },
  {
    id: 'surveyor-legacy',
    kind: 'ending',
    title: "A Mission That Didn't End With Silence",
    narration: 'factual',
    sourceIds: ['surveyor-3-footpads', 'surveyor-3-jpl'],
    reward: null,
    body: '1967: a robotic scout investigates the ground for human exploration. 1969: astronauts bring selected hardware home to study lunar exposure. Surveyor 3 remains on the Moon. Its story connects robotic preparation, human exploration, and lessons for future spacecraft.',
    instruction:
      'Academy conclusion: the mystery is solved. Select Continue to save chapter completion and unlock Lunar Archaeologist. A completed replay adds no duplicate XP.',
  },
]

const registry = createActivityRegistry([
  defineActivity('surveyor-equipment', (props) => (
    <EquipmentInvestigation {...props} />
  )),
  {
    ...defineActivity('surveyor-sequence', (props) => (
      <LandingSequence {...props} />
    )),
    validatePrompt: validateEventOrderPrompt,
  },
  defineActivity('surveyor-soil', (props) => <SoilInvestigation {...props} />),
  defineActivity('surveyor-apollo', (props) => <ApolloEvidence {...props} />),
])
if (!registry.ok) throw new Error('Invalid Surveyor 3 activity registry.')

export const chapter = {
  scenes,
  activities: registry.value,
} satisfies MissionChapter
