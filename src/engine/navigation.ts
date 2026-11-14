/**
 * Linear scene state machine.
 * It emits service effects. It does not call services itself.
 */

import type { ActivityCompletionEvent } from '@/contracts/missions.ts'
import type { MissionRuntimeState } from '@/contracts/missions.ts'
import type { SaveCheckpointInput } from '@/contracts/progress.ts'
import type { MissionProgressStatus } from '@/contracts/progress.ts'
import type {
  DiscoveryUnlockRequest,
  MilestoneCompletionRequest,
  MissionMilestoneId,
} from '@/contracts/rewards.ts'
import type { MissionCompletionEvent } from '@/contracts/missions.ts'
import { engineIssue, type EngineResult } from '@/engine/issues.ts'
import {
  type EngineScene,
  type MissionModule,
  type SceneKind,
} from '@/engine/scenes.ts'
import { validateResume, validateSceneSequence } from '@/engine/validateModule.ts'

/** Milestones the engine may request. Legacy XP comes only from `completeMission`. */
export type EngineMilestoneId = Exclude<MissionMilestoneId, 'legacy'>

export type EngineEffect =
  | { type: 'save-checkpoint'; input: SaveCheckpointInput }
  | { type: 'grant-milestone'; request: MilestoneCompletionRequest }
  | { type: 'unlock-discovery'; request: DiscoveryUnlockRequest }
  | { type: 'complete-mission'; event: MissionCompletionEvent }

export type EnginePosition = {
  missionId: MissionModule['mission']['id']
  status: MissionProgressStatus
  sceneId: string | null
  completedSceneIds: readonly string[]
}

export type NavigationSuccess = {
  position: EnginePosition
  /**
   * Ordered writes. Reward calls come before the checkpoint, except the ending:
   * the ending checkpoint is saved before `completeMission`.
   */
  effects: readonly EngineEffect[]
  /**
   * Set when an activity scene is newly completed.
   * No service accepts this event. The checkpoint id is the scene id.
   */
  activityCompletion: ActivityCompletionEvent | null
}

export type NavigationAction =
  | { type: 'start' }
  | { type: 'next' }
  | { type: 'previous' }
  | { type: 'go-to'; sceneId: string }
  | { type: 'complete'; activityComplete?: boolean }

export function createInitialPosition(module: MissionModule): EnginePosition {
  return {
    missionId: module.mission.id,
    status: 'not_started',
    sceneId: null,
    completedSceneIds: [],
  }
}

export function runtimeStateFromPosition(
  position: EnginePosition,
): MissionRuntimeState {
  return {
    missionId: position.missionId,
    status: position.status,
    currentCheckpointId: position.sceneId,
    completedCheckpointIds: position.completedSceneIds,
  }
}

export function resumePosition(
  module: MissionModule,
  progress: MissionRuntimeState,
): EngineResult<EnginePosition> {
  const issues = [
    ...validateSceneSequence(module.mission, module.scenes),
    ...validateResume(module, progress),
  ]

  if (issues.length > 0) {
    return { ok: false, issues }
  }

  return { ok: true, value: positionFromProgress(module, progress) }
}

export function openModule(
  module: MissionModule,
  progress: MissionRuntimeState | null,
): EngineResult<EnginePosition> {
  if (!progress) {
    const issues = validateSceneSequence(module.mission, module.scenes)
    if (issues.length > 0) {
      return { ok: false, issues }
    }

    return { ok: true, value: createInitialPosition(module) }
  }

  return resumePosition(module, progress)
}

export function reduceNavigation(
  module: MissionModule,
  position: EnginePosition,
  action: NavigationAction,
): EngineResult<NavigationSuccess> {
  const issues = validateSceneSequence(module.mission, module.scenes)
  if (issues.length > 0) {
    return { ok: false, issues }
  }

  switch (action.type) {
    case 'start':
      return startMission(module, position)
    case 'complete':
      return completeScene(module, position, action.activityComplete === true)
    case 'next':
      return moveScene(module, position, 1)
    case 'previous':
      return moveScene(module, position, -1)
    case 'go-to':
      return goToScene(module, position, action.sceneId)
  }
}

function startMission(
  module: MissionModule,
  position: EnginePosition,
): EngineResult<NavigationSuccess> {
  if (position.status !== 'not_started' || position.sceneId !== null) {
    return failure('already-started', null, 'This mission is already open.')
  }

  const first = module.scenes[0]
  if (!first) {
    return failure('empty-sequence', null, 'A mission needs at least one scene.')
  }

  return success(
    {
      missionId: module.mission.id,
      status: 'in_progress',
      sceneId: first.id,
      completedSceneIds: [],
    },
    [saveCheckpoint(module, first.id)],
  )
}

function completeScene(
  module: MissionModule,
  position: EnginePosition,
  activityComplete: boolean,
): EngineResult<NavigationSuccess> {
  if (position.status === 'completed') {
    return success(position, [])
  }

  const current = requireCurrent(module, position)
  if (!current.ok) {
    return current
  }

  if (position.completedSceneIds.includes(current.scene.id)) {
    return success(position, [])
  }

  const frontier = frontierIndex(module, position.completedSceneIds)
  if (current.index !== frontier) {
    return failure(
      'out-of-order',
      current.scene.id,
      'Finish the earlier scenes first.',
    )
  }

  if (current.scene.kind === 'activity' && !activityComplete) {
    return failure(
      'activity-incomplete',
      current.scene.id,
      'Finish this activity before you continue.',
    )
  }

  const completedSceneIds = orderedCompleted(
    module,
    position.completedSceneIds,
    current.scene.id,
  )

  if (current.scene.kind === 'ending') {
    return success(
      {
        missionId: module.mission.id,
        status: 'completed',
        sceneId: current.scene.id,
        completedSceneIds,
      },
      [
        saveCheckpoint(module, current.scene.id, current.scene.id),
        {
          type: 'complete-mission',
          event: {
            missionId: module.mission.id,
            completedCheckpointIds: completedSceneIds,
          },
        },
      ],
    )
  }

  const nextScene = module.scenes[current.index + 1]
  if (!nextScene) {
    return failure(
      'missing-ending',
      current.scene.id,
      'The mission needs an ending scene.',
    )
  }

  const effects: EngineEffect[] = []
  let activityCompletion: ActivityCompletionEvent | null = null

  if (
    current.scene.kind === 'story' &&
    isFirstKind(module, 'story', current.scene.id)
  ) {
    effects.push(grantMilestone(module, 'introduction', current.scene.id))
  }

  if (current.scene.kind === 'activity') {
    activityCompletion = {
      missionId: module.mission.id,
      checkpointId: current.scene.id,
      activityId: current.scene.activityId,
    }

    if (isFirstKind(module, 'activity', current.scene.id)) {
      effects.push(grantMilestone(module, 'activity', current.scene.id))
    }
  }

  if (current.scene.kind === 'discovery') {
    if (isFirstKind(module, 'discovery', current.scene.id)) {
      effects.push(grantMilestone(module, 'discovery', current.scene.id))
    }

    effects.push({
      type: 'unlock-discovery',
      request: {
        missionId: module.mission.id,
        discoveryId: current.scene.discoveryId,
      },
    })
  }

  effects.push(saveCheckpoint(module, nextScene.id, current.scene.id))

  return success(
    {
      missionId: module.mission.id,
      status: 'in_progress',
      sceneId: nextScene.id,
      completedSceneIds,
    },
    effects,
    activityCompletion,
  )
}

function moveScene(
  module: MissionModule,
  position: EnginePosition,
  delta: 1 | -1,
): EngineResult<NavigationSuccess> {
  const current = requireCurrent(module, position)
  if (!current.ok) {
    return current
  }

  const target = current.index + delta
  if (target < 0) {
    return failure('at-start', current.scene.id, 'You are on the first scene.')
  }

  if (target >= module.scenes.length) {
    return failure('at-end', current.scene.id, 'You are on the last scene.')
  }

  if (
    delta > 0 &&
    !position.completedSceneIds.includes(current.scene.id)
  ) {
    return failure(
      'scene-incomplete',
      current.scene.id,
      'Finish this scene before you move on.',
    )
  }

  return visitScene(module, position, target)
}

function goToScene(
  module: MissionModule,
  position: EnginePosition,
  sceneId: string,
): EngineResult<NavigationSuccess> {
  if (position.status === 'not_started' || position.sceneId === null) {
    return failure('not-started', null, 'Start the mission to continue.')
  }

  const index = sceneIndex(module, sceneId)
  if (index < 0) {
    return failure(
      'unknown-scene',
      sceneId,
      'That scene is not part of this mission.',
    )
  }

  return visitScene(module, position, index)
}

function visitScene(
  module: MissionModule,
  position: EnginePosition,
  index: number,
): EngineResult<NavigationSuccess> {
  const scene = module.scenes[index]
  if (!scene) {
    return failure(
      'unknown-scene',
      null,
      'That scene is not part of this mission.',
    )
  }

  if (!canVisit(module, position, index)) {
    return failure('locked', scene.id, 'Finish the earlier scenes first.')
  }

  if (scene.id === position.sceneId) {
    return success(position, [])
  }

  const next: EnginePosition = { ...position, sceneId: scene.id }
  if (position.status === 'completed') {
    return success(next, [])
  }

  return success(next, [saveCheckpoint(module, scene.id)])
}

function requireCurrent(
  module: MissionModule,
  position: EnginePosition,
): EngineResult<{ scene: EngineScene; index: number }> {
  if (position.status === 'not_started' || position.sceneId === null) {
    return {
      ok: false,
      issues: [
        engineIssue('not-started', null, 'Start the mission to continue.'),
      ],
    }
  }

  const index = sceneIndex(module, position.sceneId)
  const scene = module.scenes[index]
  if (index < 0 || !scene) {
    return {
      ok: false,
      issues: [
        engineIssue(
          'unknown-scene',
          position.sceneId,
          'That scene is not part of this mission.',
        ),
      ],
    }
  }

  return { ok: true, value: { scene, index } }
}

function canVisit(
  module: MissionModule,
  position: EnginePosition,
  index: number,
): boolean {
  if (position.status === 'completed') {
    return true
  }

  if (position.status !== 'in_progress') {
    return false
  }

  return index <= frontierIndex(module, position.completedSceneIds)
}

function frontierIndex(
  module: MissionModule,
  completedSceneIds: readonly string[],
): number {
  const index = module.scenes.findIndex(
    (scene) => !completedSceneIds.includes(scene.id),
  )

  if (index < 0) {
    return module.scenes.length - 1
  }

  return index
}

function sceneIndex(module: MissionModule, sceneId: string): number {
  return module.scenes.findIndex((scene) => scene.id === sceneId)
}

function orderedCompleted(
  module: MissionModule,
  completedSceneIds: readonly string[],
  sceneId: string,
): string[] {
  const done = new Set(completedSceneIds)
  done.add(sceneId)
  return module.scenes.map((scene) => scene.id).filter((id) => done.has(id))
}

function isFirstKind(
  module: MissionModule,
  kind: SceneKind,
  sceneId: string,
): boolean {
  return module.scenes.find((scene) => scene.kind === kind)?.id === sceneId
}

function positionFromProgress(
  module: MissionModule,
  progress: MissionRuntimeState,
): EnginePosition {
  if (progress.status === 'not_started') {
    return createInitialPosition(module)
  }

  const known = new Set(module.scenes.map((scene) => scene.id))
  const completedSceneIds = module.scenes
    .map((scene) => scene.id)
    .filter((id) => progress.completedCheckpointIds.includes(id))
  let sceneId = progress.currentCheckpointId

  if (
    progress.status === 'completed' &&
    (sceneId === null || !known.has(sceneId))
  ) {
    sceneId = module.scenes[module.scenes.length - 1]?.id ?? null
  }

  return {
    missionId: module.mission.id,
    status: progress.status,
    sceneId,
    completedSceneIds,
  }
}

function saveCheckpoint(
  module: MissionModule,
  checkpointId: string,
  completedCheckpointId?: string,
): EngineEffect {
  const input: SaveCheckpointInput = {
    missionId: module.mission.id,
    checkpointId,
  }

  if (completedCheckpointId !== undefined) {
    input.completedCheckpointId = completedCheckpointId
  }

  return { type: 'save-checkpoint', input }
}

function grantMilestone(
  module: MissionModule,
  milestoneId: EngineMilestoneId,
  checkpointId: string,
): EngineEffect {
  return {
    type: 'grant-milestone',
    request: {
      missionId: module.mission.id,
      milestoneId,
      checkpointId,
    },
  }
}

function success(
  position: EnginePosition,
  effects: readonly EngineEffect[],
  activityCompletion: ActivityCompletionEvent | null = null,
): EngineResult<NavigationSuccess> {
  return {
    ok: true,
    value: { position, effects, activityCompletion },
  }
}

function failure(
  code: Parameters<typeof engineIssue>[0],
  sceneId: string | null,
  message: string,
): EngineResult<NavigationSuccess> {
  return { ok: false, issues: [engineIssue(code, sceneId, message)] }
}
