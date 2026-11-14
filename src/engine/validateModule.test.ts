import { describe, expect, it } from 'vitest'
import { runtimeStateFromProgress } from '@/contracts/missions.ts'
import { createRegisteredSeed } from '@/mocks/fixtures.ts'
import {
  createActivityRegistry,
  defineActivity,
} from '@/engine/activityRegistry.ts'
import {
  createStructuralFixture,
  structuralFixtureNotice,
} from '@/engine/fixture.ts'
import { citationViewFor, narrationLabels } from '@/engine/index.ts'
import type { EngineScene } from '@/engine/scenes.ts'
import { validateActivityBindings } from '@/engine/activityRegistry.ts'
import {
  validateResume,
  validateSceneSequence,
} from '@/engine/validateModule.ts'
import { listMissions, lookupMission } from '@/missions/registry.ts'
import { missionIds } from '@/missions/types.ts'

function issueCodes(
  issues: readonly { code: string; sceneId?: string | null }[],
): string[] {
  return issues.map((issue) => issue.code)
}

function withScenes(
  change: (scenes: EngineScene[]) => unknown[],
): ReturnType<typeof validateSceneSequence> {
  const fixture = createStructuralFixture()
  return validateSceneSequence(fixture.mission, change([...fixture.scenes]))
}

describe('scene sequence validation', () => {
  it('accepts the structural fixture and the registered mission metadata', () => {
    const fixture = createStructuralFixture()
    const lookedUp = lookupMission('surveyor-3')

    expect(missionIds).toContain(fixture.mission.id)
    expect(listMissions()).toHaveLength(missionIds.length)
    expect(lookedUp.status).toBe('found')
    if (lookedUp.status === 'found') {
      expect(fixture.mission).toBe(lookedUp.mission)
    }

    expect(validateSceneSequence(fixture.mission, fixture.scenes)).toEqual([])

    const opening = fixture.scenes[0]
    const evidence = fixture.scenes.find((scene) => scene.kind === 'evidence')
    expect(opening?.kind).toBe('story')
    if (opening?.kind === 'story') {
      expect(opening.body).toBe(structuralFixtureNotice)
      expect(citationViewFor(fixture.mission, opening)).toEqual({
        narration: 'academy',
        label: narrationLabels.academy,
        sources: [],
      })
    }

    expect(evidence?.kind).toBe('evidence')
    if (evidence?.kind === 'evidence') {
      expect(evidence.body).toBe(structuralFixtureNotice)
      expect(citationViewFor(fixture.mission, evidence)).toEqual({
        narration: 'mixed',
        label: narrationLabels.mixed,
        sources: [fixture.mission.sources[0]],
      })
    }
  })

  it('rejects a duplicated scene id', () => {
    const fixture = createStructuralFixture()
    const issues = withScenes((scenes) =>
      scenes.map((scene, index) =>
        index === 1 ? { ...scene, id: scenes[0]?.id } : scene,
      ),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: 'duplicate-scene-id',
        sceneId: fixture.scenes[0]?.id,
      }),
    )
    expect(issues[0]?.message).not.toContain('duplicate-scene-id')
  })

  it('rejects unknown checkpoints saved by the sample profile', () => {
    const fixture = createStructuralFixture()
    const saved = createRegisteredSeed().progress.find(
      (progress) => progress.missionId === 'surveyor-3',
    )

    expect(saved).toBeDefined()
    if (!saved) {
      return
    }

    const issues = validateResume(fixture, runtimeStateFromProgress(saved))

    expect(issues.map((issue) => issue.sceneId)).toEqual([
      'evidence',
      'opening',
      'field-work',
    ])
    expect(issueCodes(issues)).toEqual([
      'unknown-scene',
      'unknown-scene',
      'unknown-scene',
    ])
    for (const issue of issues) {
      expect(issue.message).toBe('That scene is not part of this mission.')
      expect(issue.message).not.toContain(issue.sceneId ?? '')
    }
  })

  it('rejects progress for a different mission', () => {
    const fixture = createStructuralFixture()
    const saved = createRegisteredSeed().progress.find(
      (progress) => progress.missionId === 'opportunity',
    )

    expect(saved).toBeDefined()
    if (!saved) {
      return
    }

    expect(
      issueCodes(validateResume(fixture, runtimeStateFromProgress(saved))),
    ).toEqual(['mission-mismatch'])
  })

  it('rejects an empty sequence', () => {
    const fixture = createStructuralFixture()

    expect(
      validateSceneSequence(fixture.mission, []).map((issue) => issue.code),
    ).toEqual(['empty-sequence'])
  })

  it('rejects scene ids that are not stable keys', () => {
    for (const sceneId of ['Opening', '../opening', '']) {
      const issues = withScenes((scenes) =>
        scenes.map((scene, index) => (index === 0 ? { ...scene, id: sceneId } : scene)),
      )
      const invalid = issues.find((issue) => issue.code === 'invalid-scene-id')

      expect(invalid?.sceneId).toBe(sceneId)
      expect(invalid?.message).toBe(
        'Scene ids use lowercase letters, numbers, and hyphens.',
      )
    }
  })

  it('rejects malformed scene sequences', () => {
    const fixture = createStructuralFixture()
    const ending = fixture.scenes.find((scene) => scene.kind === 'ending')
    const discovery = fixture.scenes.find((scene) => scene.kind === 'discovery')
    expect(ending).toBeDefined()
    expect(discovery).toBeDefined()
    if (!ending || !discovery) {
      return
    }

    expect(issueCodes(withScenes(() => [1]))).toContain('malformed-scene')

    expect(
      issueCodes(
        withScenes((scenes) =>
          scenes.map((scene, index) =>
            index === 1 ? { ...scene, kind: 'quiz' } : scene,
          ),
        ),
      ),
    ).toContain('unknown-scene-kind')

    expect(
      issueCodes(
        withScenes((scenes) => [scenes[1], ...scenes.slice(0, 1), ...scenes.slice(2)]),
      ),
    ).toContain('introduction-not-first')

    expect(
      issueCodes(
        withScenes((scenes) =>
          scenes.map((scene) =>
            scene.kind === 'ending' ? { ...scene, kind: 'story' } : scene,
          ),
        ),
      ),
    ).toEqual(expect.arrayContaining(['missing-ending', 'ending-not-last']))

    const endingFirst = fixture.scenes.filter((scene) => scene.kind !== 'ending')
    expect(
      issueCodes(
        withScenes(() => [...endingFirst.slice(0, 3), ending, discovery]),
      ),
    ).toContain('ending-not-last')

    expect(
      issueCodes(
        withScenes((scenes) => [
          ...scenes,
          { ...ending, id: 'fixture-second-ending' },
        ]),
      ),
    ).toContain('multiple-endings')

    expect(
      issueCodes(
        withScenes((scenes) =>
          scenes.map((scene) =>
            scene.kind === 'story'
              ? { ...scene, narration: 'factual', sourceIds: [] }
              : scene,
          ),
        ),
      ),
    ).toContain('missing-citation')

    expect(
      issueCodes(
        withScenes((scenes) =>
          scenes.map((scene) =>
            scene.kind === 'evidence'
              ? { ...scene, narration: 'academy' }
              : scene,
          ),
        ),
      ),
    ).toContain('missing-citation')

    expect(
      issueCodes(
        withScenes((scenes) =>
          scenes.map((scene) =>
            scene.kind === 'evidence'
              ? { ...scene, sourceIds: ['not-a-nasa-source'] }
              : scene,
          ),
        ),
      ),
    ).toContain('unknown-source')
  })

  it('rejects an unregistered or duplicated activity type', () => {
    const fixture = createStructuralFixture()
    const empty = createActivityRegistry([])
    expect(empty.ok).toBe(true)
    if (!empty.ok) {
      return
    }

    expect(validateActivityBindings(fixture.scenes, empty.value)).toContainEqual(
      expect.objectContaining({
        code: 'unknown-activity',
        sceneId: 'fixture-activity',
      }),
    )

    const duplicate = createActivityRegistry([
      defineActivity('fixture-check', () => null),
      defineActivity('fixture-check', () => null),
    ])

    expect(duplicate.ok).toBe(false)
    if (!duplicate.ok) {
      expect(issueCodes(duplicate.issues)).toContain('duplicate-activity-type')
    }
  })
})
