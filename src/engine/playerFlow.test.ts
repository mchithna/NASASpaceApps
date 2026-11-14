import { describe, expect, it } from 'vitest'
import { missionXpCap } from '@/contracts/rewards.ts'
import type { ServiceResult } from '@/contracts/result.ts'
import { createMockServices } from '@/mocks/createMockServices.ts'
import { applyEffects } from '@/engine/checkpointAdapter.ts'
import { createStructuralFixture, structuralFixtureNotice } from '@/engine/fixture.ts'
import {
  createInitialPosition,
  reduceNavigation,
  resumePosition,
  type EnginePosition,
  type NavigationAction,
  type NavigationSuccess,
} from '@/engine/navigation.ts'
import type { MissionModule } from '@/engine/scenes.ts'

function expectValue<T>(result: ServiceResult<T>): T {
  expect(result.ok).toBe(true)
  if (!result.ok) {
    throw new Error(result.error.message)
  }
  return result.data
}

function expectNavigation(
  module: MissionModule,
  position: EnginePosition,
  action: NavigationAction,
): NavigationSuccess {
  const result = reduceNavigation(module, position, action)
  expect(result.ok).toBe(true)
  if (!result.ok) {
    throw new Error(result.issues.map((issue) => issue.code).join(', '))
  }
  return result.value
}

function lessonModule(): MissionModule {
  const { mission } = createStructuralFixture()
  const prose = {
    title: 'Fixture step',
    narration: 'academy' as const,
    sourceIds: [],
    body: structuralFixtureNotice,
  }

  return {
    mission,
    scenes: [
      { ...prose, id: 'opening', kind: 'story' },
      { ...prose, id: 'briefing', kind: 'story' },
      {
        id: 'task-one',
        kind: 'activity',
        title: 'Fixture step',
        narration: 'academy',
        sourceIds: [],
        activityId: 'task-one',
        activityType: 'fixture-check',
        config: {},
      },
      {
        id: 'task-two',
        kind: 'activity',
        title: 'Fixture step',
        narration: 'academy',
        sourceIds: [],
        activityId: 'task-two',
        activityType: 'fixture-check',
        config: {},
      },
      {
        id: 'finding',
        kind: 'discovery',
        title: 'Fixture step',
        narration: 'academy',
        sourceIds: [],
        discoveryId: 'fixture-note',
      },
      { ...prose, id: 'farewell', kind: 'ending' },
    ],
  }
}

describe('mission navigation', () => {
  it('blocks skips, unknown scenes, and unfinished activities', () => {
    const module = createStructuralFixture()
    const started = expectNavigation(module, createInitialPosition(module), {
      type: 'start',
    })

    const skipped = reduceNavigation(module, started.position, {
      type: 'go-to',
      sceneId: 'fixture-ending',
    })
    expect(skipped.ok).toBe(false)
    if (!skipped.ok) {
      expect(skipped.issues[0]?.code).toBe('locked')
    }

    const unknown = reduceNavigation(module, started.position, {
      type: 'go-to',
      sceneId: '../secret',
    })
    expect(unknown.ok).toBe(false)
    if (!unknown.ok) {
      expect(unknown.issues[0]?.code).toBe('unknown-scene')
      expect(unknown.issues[0]?.message).not.toContain('../')
    }

    const earlyNext = reduceNavigation(module, started.position, {
      type: 'next',
    })
    expect(earlyNext.ok).toBe(false)
    if (!earlyNext.ok) {
      expect(earlyNext.issues[0]?.code).toBe('scene-incomplete')
    }

    const evidence = expectNavigation(module, started.position, {
      type: 'complete',
    })
    const activity = expectNavigation(module, evidence.position, {
      type: 'complete',
    })
    const unfinished = reduceNavigation(module, activity.position, {
      type: 'complete',
    })

    expect(unfinished.ok).toBe(false)
    if (!unfinished.ok) {
      expect(unfinished.issues[0]?.code).toBe('activity-incomplete')
    }
    expect(activity.position.sceneId).toBe('fixture-activity')
  })

  it('grants each milestone once and leaves legacy to mission completion', () => {
    const module = lessonModule()
    const milestones: string[] = []
    const activityIds: string[] = []
    let position = createInitialPosition(module)
    position = expectNavigation(module, position, { type: 'start' }).position

    for (let guard = 0; position.status !== 'completed' && guard < 8; guard += 1) {
      const scene = module.scenes.find((item) => item.id === position.sceneId)
      const step = expectNavigation(module, position, {
        type: 'complete',
        activityComplete: scene?.kind === 'activity',
      })

      for (const effect of step.effects) {
        if (effect.type === 'grant-milestone') {
          milestones.push(effect.request.milestoneId)
          expect(effect.request).not.toHaveProperty('xp')
        }
        if (effect.type === 'complete-mission') {
          expect(Object.keys(effect.event)).toEqual([
            'missionId',
            'completedCheckpointIds',
          ])
        }
      }

      if (step.activityCompletion) {
        activityIds.push(step.activityCompletion.activityId)
      }

      position = step.position
    }

    expect(position.status).toBe('completed')
    expect(milestones).toEqual(['introduction', 'activity', 'discovery'])
    expect(activityIds).toEqual(['task-one', 'task-two'])
  })

  it('replays a completed mission without writing checkpoints', () => {
    const module = createStructuralFixture()
    const resumed = resumePosition(module, {
      missionId: 'surveyor-3',
      status: 'completed',
      currentCheckpointId: 'fixture-ending',
      completedCheckpointIds: module.scenes.map((scene) => scene.id),
    })

    expect(resumed.ok).toBe(true)
    if (!resumed.ok) {
      return
    }

    const revisited = expectNavigation(module, resumed.value, {
      type: 'go-to',
      sceneId: 'fixture-opening',
    })
    const repeated = expectNavigation(module, revisited.position, {
      type: 'complete',
    })

    expect(revisited.effects).toEqual([])
    expect(repeated.effects).toEqual([])
    expect(repeated.position.status).toBe('completed')
  })

  it('refuses to start a sequence with a duplicated scene id', () => {
    const fixture = createStructuralFixture()
    const broken: MissionModule = {
      mission: fixture.mission,
      scenes: fixture.scenes.map((scene, index) =>
        index === 1 ? { ...scene, id: 'fixture-opening' } : scene,
      ),
    }
    const result = reduceNavigation(
      broken,
      createInitialPosition(broken),
      { type: 'start' },
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.issues.map((issue) => issue.code)).toContain(
        'duplicate-scene-id',
      )
    }
  })
})

describe('checkpoint adapter', () => {
  it('plays the fixture through the mock services without sending xp', async () => {
    const module = createStructuralFixture()
    const services = createMockServices({ persona: 'guest' })
    const saves: unknown[] = []
    const grants: unknown[] = []
    const unlocks: unknown[] = []
    const completions: unknown[] = []
    const activityEvents: unknown[] = []
    const watching = {
      progress: {
        ...services.progress,
        saveCheckpoint: async (input: { missionId: string; checkpointId: string }) => {
          saves.push(input)
          return services.progress.saveCheckpoint(input)
        },
        completeMission: async (input: { missionId: string }) => {
          completions.push(input)
          return services.progress.completeMission(input)
        },
      },
      rewards: {
        ...services.rewards,
        grantMilestone: async (input: { missionId: string; milestoneId: string }) => {
          grants.push(input)
          return services.rewards.grantMilestone(input)
        },
        unlockDiscovery: async (input: { missionId: string; discoveryId: string }) => {
          unlocks.push(input)
          return services.rewards.unlockDiscovery(input)
        },
      },
    }

    let position = createInitialPosition(module)
    let step = expectNavigation(module, position, { type: 'start' })
    expect(expectValue(await applyEffects(watching, step.effects))).toBeNull()
    position = step.position

    for (let guard = 0; position.status !== 'completed' && guard < 8; guard += 1) {
      const scene = module.scenes.find((item) => item.id === position.sceneId)
      step = expectNavigation(module, position, {
        type: 'complete',
        activityComplete: scene?.kind === 'activity',
      })
      if (step.activityCompletion) {
        activityEvents.push(step.activityCompletion)
      }
      expect(expectValue(await applyEffects(watching, step.effects))).toBeNull()
      position = step.position
    }

    expect(position.status).toBe('completed')
    expect(saves).toEqual([
      { missionId: 'surveyor-3', checkpointId: 'fixture-opening' },
      {
        missionId: 'surveyor-3',
        checkpointId: 'fixture-evidence',
        completedCheckpointId: 'fixture-opening',
      },
      {
        missionId: 'surveyor-3',
        checkpointId: 'fixture-activity',
        completedCheckpointId: 'fixture-evidence',
      },
      {
        missionId: 'surveyor-3',
        checkpointId: 'fixture-discovery',
        completedCheckpointId: 'fixture-activity',
      },
      {
        missionId: 'surveyor-3',
        checkpointId: 'fixture-ending',
        completedCheckpointId: 'fixture-discovery',
      },
      {
        missionId: 'surveyor-3',
        checkpointId: 'fixture-ending',
        completedCheckpointId: 'fixture-ending',
      },
    ])
    expect(grants).toEqual([
      { missionId: 'surveyor-3', milestoneId: 'introduction' },
      { missionId: 'surveyor-3', milestoneId: 'activity' },
      { missionId: 'surveyor-3', milestoneId: 'discovery' },
    ])
    expect(unlocks).toEqual([
      { missionId: 'surveyor-3', discoveryId: 'fixture-note' },
    ])
    expect(completions).toEqual([{ missionId: 'surveyor-3' }])
    expect(activityEvents).toEqual([
      {
        missionId: 'surveyor-3',
        checkpointId: 'fixture-activity',
        activityId: 'fixture-task',
      },
    ])

    const summary = expectValue(await services.rewards.getXpSummary())
    expect(summary.totalXp).toBe(missionXpCap)
    expect(summary.rank.name).toBe('Lunar Explorer')
    expect(summary.events.map((event) => event.milestoneId)).toEqual([
      'introduction',
      'activity',
      'discovery',
      'legacy',
    ])

    const journal = expectValue(await services.rewards.listJournalEntries())
    expect(journal).toEqual([
      expect.objectContaining({
        missionId: 'surveyor-3',
        discoveryId: 'fixture-note',
        contentStatus: 'placeholder',
      }),
    ])

    const replay = expectNavigation(module, position, {
      type: 'go-to',
      sceneId: 'fixture-opening',
    })
    expect(replay.effects).toEqual([])
    expect(expectValue(await applyEffects(watching, replay.effects))).toBeNull()
    expect(saves).toHaveLength(6)

    const afterReplay = expectValue(await services.rewards.getXpSummary())
    expect(afterReplay.totalXp).toBe(missionXpCap)
  })
})
