/**
 * Structural fixture for engine tests.
 * It reuses a registered mission and does not add a sixth mission id.
 * The text is not chapter copy and not a NASA measurement.
 */

import { lookupMission } from '@/missions/registry.ts'
import type { EngineScene, MissionModule } from '@/engine/scenes.ts'

export const structuralFixtureNotice =
  'Structural engine fixture. Not mission content and not a NASA measurement.'

/**
 * Scene ids are the checkpoint ids for this fixture.
 * They are intentionally different from the mock sample ids
 * `opening`, `field-work`, `evidence`, and `farewell`.
 */
export function createStructuralFixture(): MissionModule {
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
      id: 'fixture-opening',
      kind: 'story',
      title: 'Fixture opening',
      narration: 'academy',
      sourceIds: [],
      body: structuralFixtureNotice,
    },
    {
      id: 'fixture-evidence',
      kind: 'evidence',
      title: 'Fixture evidence',
      narration: 'mixed',
      sourceIds: [source.id],
      body: structuralFixtureNotice,
    },
    {
      id: 'fixture-activity',
      kind: 'activity',
      title: 'Fixture activity',
      narration: 'academy',
      sourceIds: [],
      activityId: 'fixture-task',
      activityType: 'fixture-check',
      config: {},
    },
    {
      id: 'fixture-discovery',
      kind: 'discovery',
      title: 'Fixture discovery',
      narration: 'academy',
      sourceIds: [],
      discoveryId: 'fixture-note',
    },
    {
      id: 'fixture-ending',
      kind: 'ending',
      title: 'Fixture ending',
      narration: 'academy',
      sourceIds: [],
      body: structuralFixtureNotice,
    },
  ]

  return {
    mission: result.mission,
    scenes,
  }
}
