/**
 * Training simulator module.
 * It reuses the registered Surveyor 3 metadata so it is not a sixth mission id.
 * The scene text is practice copy, not a chapter and not a NASA measurement.
 */

import { lookupMission } from '@/missions/registry.ts'
import type { EventOrderPrompt } from '@/engine/activities/prompts.ts'
import type { EngineScene, MissionModule } from '@/engine/scenes.ts'

export const trainingSimulatorLabel =
  'Training simulator. Not a production mission and not NASA chapter content.'

export const trainingScenarioId = 'training-simulator' as const

const timelinePrompt: EventOrderPrompt = {
  type: 'event-order',
  instruction: 'Put the practice steps in order. This is not a NASA timeline.',
  steps: [
    { id: 'read-card', label: 'Read the practice card' },
    { id: 'mark-card', label: 'Mark the practice card' },
  ],
  correctOrder: ['read-card', 'mark-card'],
  initialOrder: ['mark-card', 'read-card'],
  explanation:
    'The practice card is read before it is marked. This order is not a NASA procedure.',
}

export function createTrainingSimulator(): MissionModule {
  const result = lookupMission('surveyor-3')
  if (result.status !== 'found') {
    throw new Error('Surveyor 3 is missing from the mission registry.')
  }

  const source = result.mission.sources[0]
  if (!source) {
    throw new Error('Surveyor 3 is missing a source citation.')
  }

  const scenes: EngineScene[] = [
    {
      id: 'sim-intro',
      kind: 'story',
      title: 'Training simulator intro',
      narration: 'academy',
      sourceIds: [],
      body: `${trainingSimulatorLabel} This opening is academy narration, not a NASA quotation.`,
    },
    {
      id: 'sim-evidence',
      kind: 'evidence',
      title: 'Training simulator evidence',
      narration: 'mixed',
      sourceIds: [source.id],
      media: null,
      body: `${trainingSimulatorLabel} The link is the mission's existing source. This sentence is not a NASA quotation.`,
    },
    {
      id: 'sim-timeline',
      kind: 'activity',
      title: 'Training simulator timeline',
      narration: 'academy',
      sourceIds: [],
      activityId: 'sim-timeline',
      activityType: 'event-order',
      config: {},
      prompt: timelinePrompt,
    },
    {
      id: 'sim-slot',
      kind: 'activity',
      title: 'Training simulator custom slot',
      narration: 'academy',
      sourceIds: [],
      activityId: 'sim-slot',
      activityType: 'training-slot',
      config: {
        label: 'Practice slot for a future chapter package.',
      },
    },
    {
      id: 'sim-discovery',
      kind: 'discovery',
      title: 'Training simulator discovery',
      narration: 'academy',
      sourceIds: [],
      discoveryId: 'sim-note',
      body: `${trainingSimulatorLabel} This discovery id is a practice note, not a NASA finding.`,
    },
    {
      id: 'sim-ending',
      kind: 'ending',
      title: 'Training simulator ending',
      narration: 'academy',
      sourceIds: [],
      body: `${trainingSimulatorLabel} Finishing this practice visit is not a NASA record.`,
    },
  ]

  return {
    mission: result.mission,
    scenes,
  }
}
