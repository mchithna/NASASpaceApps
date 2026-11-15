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
  rewardScene,
  sceneActivity,
  type EngineScene,
  type MissionModule,
} from '@/engine/scenes.ts'
import {
  validateResume,
  validateSceneSequence,
} from '@/engine/validateModule.ts'

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
  | { type: 'restart' }
  | { type: 'go-to'; sceneId: string }
  | { type: 'complete'; activityComplete?: boolean }

export type SceneNavigationState = {
  sceneIndex: number | null
  sceneCount: number
  progressValue: number
  progressMax: number
  /** Visible text such as "2 of 5". */
  progressLabel: string
  canGoBack: boolean
  canGoNext: boolean
  /** A reading scene at the frontier can be marked done. Activities cannot. */
  canContinue: boolean
  canRestart: boolean
}

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
    case 'restart':
      return restartMission(module, position)
    case 'go-to':
      return goToScene(module, position, action.sceneId)
  }
}

export function sceneNavigationState(
  module: MissionModule,
  position: EnginePosition,
): SceneNavigationState {
  const sceneCount = module.scenes.length
  const index = sceneIndex(module, position.sceneId ?? '')
  const started = position.status !== 'not_started' && index >= 0
  const scene = index >= 0 ? module.scenes[index] : undefined
  const currentComplete =
    scene !== undefined && position.completedSceneIds.includes(scene.id)
  const atLast = index === sceneCount - 1
  const replay = position.status === 'completed'
  const frontier = frontierIndex(module, position.completedSceneIds)

  return {
    sceneIndex: started ? index : null,
    sceneCount,
    progressValue: started ? index + 1 : 0,
    progressMax: sceneCount,
    progressLabel: started
      ? `${index + 1} of ${sceneCount}`
      : `0 of ${sceneCount}`,
    canGoBack: started && index > 0,
    canGoNext: started && !atLast && (replay || currentComplete),
    canContinue:
      position.status === 'in_progress' &&
      scene !== undefined &&
      !currentComplete &&
      index === frontier &&
      sceneActivity(scene) === null,
    canRestart: started && index > 0,
  }
}

function restartMission(
  module: MissionModule,
  position: EnginePosition,
): EngineResult<NavigationSuccess> {
  if (position.status === 'not_started' || position.sceneId === null) {
    return failure('not-started', null, 'Start the mission to continue.')
  }

  const first = module.scenes[0]
  if (!first) {
    return failure(
      'empty-sequence',
      null,
      'A mission needs at least one scene.',
    )
  }

  if (position.sceneId === first.id) {
    return success(position, [])
  }

  return visitScene(module, position, 0)
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
    return failure(
      'empty-sequence',
      null,
      'A mission needs at least one scene.',
    )
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

  const { scene, index } = current.value

  if (position.completedSceneIds.includes(scene.id)) {
    return success(position, [])
  }

  const frontier = frontierIndex(module, position.completedSceneIds)
  if (index !== frontier) {
    return failure('out-of-order', scene.id, 'Finish the earlier scenes first.')
  }

  if (sceneActivity(scene) && !activityComplete) {
    return failure(
      'activity-incomplete',
      scene.id,
      'Finish this activity before you continue.',
    )
  }

  const completedSceneIds = orderedCompleted(
    module,
    position.completedSceneIds,
    scene.id,
  )

  if (scene.kind === 'ending') {
    return success(
      {
        missionId: module.mission.id,
        status: 'completed',
        sceneId: scene.id,
        completedSceneIds,
      },
      [
        saveCheckpoint(module, scene.id, scene.id),
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

  const nextScene = module.scenes[index + 1]
  if (!nextScene) {
    return failure(
      'missing-ending',
      scene.id,
      'The mission needs an ending scene.',
    )
  }

  const effects: EngineEffect[] = []
  let activityCompletion: ActivityCompletionEvent | null = null

  const activity = sceneActivity(scene)
  if (activity) {
    activityCompletion = {
      missionId: module.mission.id,
      checkpointId: scene.id,
      activityId: activity.activityId,
    }
  }

  for (const milestone of ['introduction', 'activity', 'discovery'] as const) {
    if (rewardScene(module, milestone)?.id === scene.id) {
      effects.push(grantMilestone(module, milestone, scene.id))
    }
  }

  if (scene.kind === 'discovery') {
    effects.push({
      type: 'unlock-discovery',
      request: {
        missionId: module.mission.id,
        discoveryId: scene.discoveryId,
      },
    })
  }

  effects.push(saveCheckpoint(module, nextScene.id, scene.id))

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

  const { scene, index } = current.value
  const target = index + delta
  if (target < 0) {
    return failure('at-start', scene.id, 'You are on the first scene.')
  }

  if (target >= module.scenes.length) {
    return failure('at-end', scene.id, 'You are on the last scene.')
  }

  if (delta > 0 && !position.completedSceneIds.includes(scene.id)) {
    return failure(
      'scene-incomplete',
      scene.id,
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
