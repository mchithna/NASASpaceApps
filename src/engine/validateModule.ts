/**
 * Pure checks for a scene sequence and for saved checkpoints.
 * Expected problems are issues. They do not throw.
 */

import { isStableKey } from '@/contracts/ids.ts'
import type { MissionRuntimeState } from '@/contracts/missions.ts'
import type { MissionDefinition } from '@/missions/types.ts'
import {
  engineIssue,
  type EngineIssue,
} from '@/engine/issues.ts'
import {
  isNarrationKind,
  isSceneKind,
  type ActivityConfig,
  type MissionModule,
  type NarrationKind,
  type SceneKind,
} from '@/engine/scenes.ts'

type SceneHead = {
  id: string | null
  kind: SceneKind | null
}

export function validateSceneSequence(
  mission: MissionDefinition,
  scenes: readonly unknown[],
): EngineIssue[] {
  if (scenes.length === 0) {
    return [
      engineIssue(
        'empty-sequence',
        null,
        'A mission needs at least one scene.',
      ),
    ]
  }

  const issues: EngineIssue[] = []
  const seenSceneIds = new Set<string>()
  const seenActivityIds = new Set<string>()
  const seenDiscoveryIds = new Set<string>()
  const heads: SceneHead[] = []

  for (const scene of scenes) {
    heads.push(
      inspectScene(
        mission,
        scene,
        issues,
        seenSceneIds,
        seenActivityIds,
        seenDiscoveryIds,
      ),
    )
  }

  const first = heads[0]
  if (!first || first.kind !== 'story') {
    issues.push(
      engineIssue(
        'introduction-not-first',
        first?.id ?? null,
        'The first scene must be a story scene.',
      ),
    )
  }

  if (!heads.some((head) => head.kind === 'activity')) {
    issues.push(
      engineIssue(
        'missing-activity',
        null,
        'The mission needs an activity scene.',
      ),
    )
  }

  if (!heads.some((head) => head.kind === 'discovery')) {
    issues.push(
      engineIssue(
        'missing-discovery',
        null,
        'The mission needs a discovery scene.',
      ),
    )
  }

  const endingIndexes = heads.flatMap((head, index) =>
    head.kind === 'ending' ? [index] : [],
  )
  const last = heads[heads.length - 1]

  if (endingIndexes.length === 0) {
    issues.push(
      engineIssue('missing-ending', null, 'The mission needs an ending scene.'),
    )
  } else if (endingIndexes.length > 1) {
    const extra = heads[endingIndexes[1] ?? 0]
    issues.push(
      engineIssue(
        'multiple-endings',
        extra?.id ?? null,
        'A mission has one ending scene.',
      ),
    )
  }

  if (!last || last.kind !== 'ending') {
    issues.push(
      engineIssue(
        'ending-not-last',
        last?.id ?? null,
        'The ending scene must be last.',
      ),
    )
  }

  return issues
}

export function validateResume(
  module: MissionModule,
  progress: MissionRuntimeState,
): EngineIssue[] {
  if (progress.missionId !== module.mission.id) {
    return [
      engineIssue(
        'mission-mismatch',
        null,
        'That progress belongs to a different mission.',
      ),
    ]
  }

  if (progress.status === 'not_started') {
    if (
      progress.currentCheckpointId !== null ||
      progress.completedCheckpointIds.length > 0
    ) {
      return [
        engineIssue(
          'invalid-progress',
          progress.currentCheckpointId,
          'A mission that has not started cannot have checkpoints.',
        ),
      ]
    }

    return []
  }

  const issues: EngineIssue[] = []

  if (
    progress.status === 'in_progress' &&
    progress.currentCheckpointId === null
  ) {
    issues.push(
      engineIssue(
        'invalid-progress',
        null,
        'An in-progress mission needs a checkpoint.',
      ),
    )
  }

  const known = new Set(module.scenes.map((scene) => scene.id))
  const reported = new Set<string>()

  reportUnknown(
    progress.currentCheckpointId,
    known,
    reported,
    issues,
  )

  for (const checkpointId of progress.completedCheckpointIds) {
    reportUnknown(checkpointId, known, reported, issues)
  }

  return issues
}

function reportUnknown(
  checkpointId: string | null,
  known: ReadonlySet<string>,
  reported: Set<string>,
  issues: EngineIssue[],
): void {
  if (
    checkpointId === null ||
    known.has(checkpointId) ||
    reported.has(checkpointId)
  ) {
    return
  }

  reported.add(checkpointId)
  issues.push(
    engineIssue(
      'unknown-scene',
      checkpointId,
      'That scene is not part of this mission.',
    ),
  )
}

function inspectScene(
  mission: MissionDefinition,
  scene: unknown,
  issues: EngineIssue[],
  seenSceneIds: Set<string>,
  seenActivityIds: Set<string>,
  seenDiscoveryIds: Set<string>,
): SceneHead {
  if (!isRecord(scene)) {
    issues.push(
      engineIssue(
        'malformed-scene',
        null,
        'A scene is missing required information.',
      ),
    )
    return { id: null, kind: null }
  }

  const id = readSceneId(scene.id, issues, seenSceneIds)
  const kind = readKind(scene.kind, id, issues)
  readTitle(scene.title, id, issues)
  const narration = readNarration(scene.narration, id, issues)
  const sourceIds = readSourceIds(mission, scene.sourceIds, id, issues)

  const academyEvidence = kind === 'evidence' && narration === 'academy'
  const missingSource =
    sourceIds !== null &&
    sourceIds.length === 0 &&
    (kind === 'evidence' || (narration !== null && narration !== 'academy'))

  if (academyEvidence || missingSource) {
    issues.push(
      engineIssue(
        'missing-citation',
        id,
        'Sourced scenes need a citation from the mission.',
      ),
    )
  }

  if (kind === 'story' || kind === 'evidence' || kind === 'ending') {
    readBody(scene.body, id, issues)
  }

  if (kind === 'activity') {
    readActivity(scene, id, issues, seenActivityIds)
  }

  if (kind === 'discovery') {
    readDiscovery(scene.discoveryId, id, issues, seenDiscoveryIds)
  }

  return { id, kind }
}

function readSceneId(
  value: unknown,
  issues: EngineIssue[],
  seenSceneIds: Set<string>,
): string | null {
  if (typeof value !== 'string' || !isStableKey(value)) {
    issues.push(
      engineIssue(
        'invalid-scene-id',
        typeof value === 'string' ? value : null,
        'Scene ids use lowercase letters, numbers, and hyphens.',
      ),
    )
    return typeof value === 'string' ? value : null
  }

  if (seenSceneIds.has(value)) {
    issues.push(
      engineIssue(
        'duplicate-scene-id',
        value,
        'A scene id is used more than once.',
      ),
    )
  }

  seenSceneIds.add(value)
  return value
}

function readKind(
  value: unknown,
  sceneId: string | null,
  issues: EngineIssue[],
): SceneKind | null {
  if (typeof value !== 'string' || !isSceneKind(value)) {
    issues.push(
      engineIssue(
        'unknown-scene-kind',
        sceneId,
        'That scene type is not supported.',
      ),
    )
    return null
  }

  return value
}

function readTitle(
  value: unknown,
  sceneId: string | null,
  issues: EngineIssue[],
): void {
  if (typeof value !== 'string') {
    issues.push(
      engineIssue(
        'malformed-scene',
        sceneId,
        'A scene is missing required information.',
      ),
    )
    return
  }

  if (value.trim().length === 0) {
    issues.push(engineIssue('empty-title', sceneId, 'A scene needs a title.'))
  }
}

function readBody(
  value: unknown,
  sceneId: string | null,
  issues: EngineIssue[],
): void {
  if (typeof value !== 'string') {
    issues.push(
      engineIssue(
        'malformed-scene',
        sceneId,
        'A scene is missing required information.',
      ),
    )
    return
  }

  if (value.trim().length === 0) {
    issues.push(engineIssue('empty-body', sceneId, 'This scene needs text.'))
  }
}

function readNarration(
  value: unknown,
  sceneId: string | null,
  issues: EngineIssue[],
): NarrationKind | null {
  if (typeof value !== 'string' || !isNarrationKind(value)) {
    issues.push(
      engineIssue(
        'invalid-narration',
        sceneId,
        'A scene must say whether it is academy narration, a NASA source, or both.',
      ),
    )
    return null
  }

  return value
}

function readSourceIds(
  mission: MissionDefinition,
  value: unknown,
  sceneId: string | null,
  issues: EngineIssue[],
): readonly string[] | null {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    issues.push(
      engineIssue(
        'malformed-scene',
        sceneId,
        'A scene is missing required information.',
      ),
    )
    return null
  }

  const sourceIds = value as readonly string[]
  const known = new Set(mission.sources.map((source) => source.id))
  const seen = new Set<string>()

  for (const sourceId of sourceIds) {
    if (!known.has(sourceId)) {
      issues.push(
        engineIssue(
          'unknown-source',
          sceneId,
          'A scene cites a source that is not on this mission.',
        ),
      )
    }

    if (seen.has(sourceId)) {
      issues.push(
        engineIssue(
          'duplicate-source',
          sceneId,
          'A scene repeats the same citation.',
        ),
      )
    }

    seen.add(sourceId)
  }

  return sourceIds
}

function readActivity(
  scene: Record<string, unknown>,
  sceneId: string | null,
  issues: EngineIssue[],
  seenActivityIds: Set<string>,
): void {
  if (typeof scene.activityId !== 'string' || !isStableKey(scene.activityId)) {
    issues.push(
      engineIssue(
        'invalid-activity-id',
        sceneId,
        'Activity ids use lowercase letters, numbers, and hyphens.',
      ),
    )
  } else if (seenActivityIds.has(scene.activityId)) {
    issues.push(
      engineIssue(
        'duplicate-activity-id',
        sceneId,
        'An activity id is used more than once.',
      ),
    )
  } else {
    seenActivityIds.add(scene.activityId)
  }

  if (typeof scene.activityType !== 'string' || !isStableKey(scene.activityType)) {
    issues.push(
      engineIssue(
        'invalid-activity-type',
        sceneId,
        'Activity types use lowercase letters, numbers, and hyphens.',
      ),
    )
  }

  if (scene.config !== undefined && !isActivityConfig(scene.config)) {
    issues.push(
      engineIssue(
        'invalid-activity-config',
        sceneId,
        'Activity settings must be simple values.',
      ),
    )
  }
}

function readDiscovery(
  value: unknown,
  sceneId: string | null,
  issues: EngineIssue[],
  seenDiscoveryIds: Set<string>,
): void {
  if (typeof value !== 'string' || !isStableKey(value)) {
    issues.push(
      engineIssue(
        'invalid-discovery-id',
        sceneId,
        'Discovery ids use lowercase letters, numbers, and hyphens.',
      ),
    )
    return
  }

  if (seenDiscoveryIds.has(value)) {
    issues.push(
      engineIssue(
        'duplicate-discovery-id',
        sceneId,
        'A discovery id is used more than once.',
      ),
    )
    return
  }

  seenDiscoveryIds.add(value)
}

function isActivityConfig(value: unknown): value is ActivityConfig {
  if (!isRecord(value)) {
    return false
  }

  return Object.entries(value).every(
    ([key, entry]) => key.length > 0 && isConfigValue(entry),
  )
}

function isConfigValue(value: unknown): boolean {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return true
  }

  return typeof value === 'number' && Number.isFinite(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
