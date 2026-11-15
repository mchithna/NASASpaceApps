/**
 * Injected bridge from engine effects to ProgressService and RewardsService.
 * Phase 4B can pass real services here. This file does not import Supabase.
 * A confirmed write is not sent again. A failed write stays retryable.
 */

import { isStableKey } from '@/contracts/ids.ts'
import { runtimeStateFromProgress } from '@/contracts/missions.ts'
import type { MissionRuntimeState } from '@/contracts/missions.ts'
import {
  serviceError,
  serviceOk,
  type ServiceResult,
} from '@/contracts/result.ts'
import { isMissionMilestoneId } from '@/contracts/rewards.ts'
import type { MissionId } from '@/missions/types.ts'
import {
  applyEffects,
  type EngineServices,
} from '@/engine/checkpointAdapter.ts'
import type { EngineEffect } from '@/engine/navigation.ts'
import type { MissionRuntimeAdapter } from '@/engine/trainingRuntime.ts'
import type { MissionModule } from '@/engine/scenes.ts'
import { rewardScene } from '@/engine/scenes.ts'
import { validateResume } from '@/engine/validateModule.ts'
import type { AuthService } from '@/contracts/services.ts'

export type ServiceRuntime = MissionRuntimeAdapter & {
  dispose(): void
  /**
   * Reads the checkpoint stored on this service instance.
   * The mock keeps that state only until the instance is discarded.
   */
  loadProgress(
    missionId: MissionId,
  ): Promise<ServiceResult<MissionRuntimeState>>
}

export function createServiceRuntime(
  services: EngineServices & { auth?: AuthService },
  module?: MissionModule,
  expectedExplorerId?: string,
): ServiceRuntime {
  const confirmed = new Set<string>()
  const inflight = new Map<string, Promise<ServiceResult<null>>>()
  let disposed = false
  async function checkVisit(): Promise<ServiceResult<null>> {
    if (disposed)
      return serviceError(
        'conflict',
        'This mission visit has ended. Reload your saved place.',
      )
    if (expectedExplorerId !== undefined) {
      const session = await services.auth?.getSession()
      if (
        !session?.ok ||
        (session.data.status !== 'guest' &&
          session.data.status !== 'authenticated') ||
        session.data.identity.explorerId !== expectedExplorerId
      ) {
        return serviceError(
          'unauthenticated',
          'Your explorer session changed. Reload your saved place.',
        )
      }
    }
    return disposed
      ? serviceError('conflict', 'This mission visit has ended.')
      : serviceOk(null)
  }

  return {
    dispose() {
      disposed = true
    },
    apply(effects) {
      if (
        module &&
        effects.some((effect) => !belongsToModule(effect, module))
      ) {
        return Promise.resolve(
          serviceError(
            'invalid-input',
            'That checkpoint or reward is not part of this chapter.',
          ),
        )
      }
      // The trusted checkpoint RPC commits scene evidence and its rewards together.
      // Other adapters retain the original Phase 4A effect order.
      const ordered = module
        ? [
            ...effects.filter((effect) => effect.type === 'save-checkpoint'),
            ...effects.filter((effect) => effect.type !== 'save-checkpoint'),
          ]
        : effects
      const pending = ordered.filter(
        (effect) =>
          effect.type === 'save-checkpoint' ||
          !confirmed.has(effectKey(effect)),
      )
      if (pending.length === 0) {
        return Promise.resolve(serviceOk(null))
      }

      const signature = pending.map(effectKey).join('\n')
      const current = inflight.get(signature)
      if (current) {
        return current
      }

      const run = applyPending(
        services,
        pending,
        confirmed,
        checkVisit,
      ).finally(() => {
        inflight.delete(signature)
      })
      inflight.set(signature, run)
      return run
    },
    async loadProgress(missionId) {
      const visit = await checkVisit()
      if (!visit.ok) return visit
      const loaded = await loadProgress(services, missionId)
      if (!loaded.ok || !module) return loaded
      const issues = validateResume(module, loaded.data)
      if (issues.length)
        return serviceError('invalid-input', issues[0]!.message)
      if (loaded.data.status !== 'in_progress') return loaded
      // Session-local guest writes cannot share a database transaction. Replay
      // deterministic outcomes from persisted scene evidence before exposing Next.
      for (const milestone of [
        'introduction',
        'activity',
        'discovery',
      ] as const) {
        const first = rewardScene(module, milestone)
        if (first && loaded.data.completedCheckpointIds.includes(first.id)) {
          const active = await checkVisit()
          if (!active.ok) return active
          const granted = await services.rewards.grantMilestone({
            missionId,
            milestoneId: milestone,
          })
          if (!granted.ok) return granted
        }
      }
      for (const scene of module.scenes) {
        if (
          scene.kind === 'discovery' &&
          loaded.data.completedCheckpointIds.includes(scene.id)
        ) {
          const active = await checkVisit()
          if (!active.ok) return active
          const unlocked = await services.rewards.unlockDiscovery({
            missionId,
            discoveryId: scene.discoveryId,
          })
          if (!unlocked.ok) return unlocked
        }
      }
      // Repair an interrupted final callback, including a lost completion response.
      const ending = module.scenes.at(-1)
      if (ending && loaded.data.completedCheckpointIds.includes(ending.id)) {
        const active = await checkVisit()
        if (!active.ok) return active
        const completed = await services.progress.completeMission({ missionId })
        if (!completed.ok) return completed
        return serviceOk(runtimeStateFromProgress(completed.data.progress))
      }
      return loaded
    },
  }
}

async function loadProgress(
  services: EngineServices,
  missionId: MissionId,
): Promise<ServiceResult<MissionRuntimeState>> {
  const result = await services.progress.getMissionProgress(missionId)
  if (!result.ok) {
    return result
  }

  return serviceOk(runtimeStateFromProgress(result.data))
}

async function applyPending(
  services: EngineServices,
  effects: readonly EngineEffect[],
  confirmed: Set<string>,
  checkVisit: () => Promise<ServiceResult<null>>,
): Promise<ServiceResult<null>> {
  for (const effect of effects) {
    const visit = await checkVisit()
    if (!visit.ok) return visit
    const key = effectKey(effect)
    if (effect.type !== 'save-checkpoint' && confirmed.has(key)) {
      continue
    }

    const invalid = invalidEffect(effect)
    if (invalid) {
      return invalid
    }

    const result = await applyEffects(services, [effect])
    if (!result.ok) {
      return result
    }

    confirmed.add(key)
  }

  return serviceOk(null)
}

function belongsToModule(effect: EngineEffect, module: MissionModule): boolean {
  const missionId =
    effect.type === 'save-checkpoint'
      ? effect.input.missionId
      : effect.type === 'complete-mission'
        ? effect.event.missionId
        : effect.request.missionId
  if (missionId !== module.mission.id) return false
  if (effect.type === 'save-checkpoint') {
    return (
      module.scenes.some((scene) => scene.id === effect.input.checkpointId) &&
      (effect.input.completedCheckpointId === undefined ||
        module.scenes.some(
          (scene) => scene.id === effect.input.completedCheckpointId,
        ))
    )
  }
  if (effect.type === 'unlock-discovery') {
    return module.scenes.some(
      (scene) =>
        scene.kind === 'discovery' &&
        scene.discoveryId === effect.request.discoveryId,
    )
  }
  if (effect.type === 'grant-milestone') {
    return (
      rewardScene(module, effect.request.milestoneId)?.id ===
      effect.request.checkpointId
    )
  }
  return true
}

function invalidEffect(effect: EngineEffect): ServiceResult<null> | null {
  switch (effect.type) {
    case 'save-checkpoint':
      if (
        !isStableKey(effect.input.checkpointId) ||
        (effect.input.completedCheckpointId !== undefined &&
          !isStableKey(effect.input.completedCheckpointId))
      ) {
        return serviceError(
          'invalid-input',
          'Checkpoint names use lowercase letters, numbers, and hyphens.',
        )
      }
      return null
    case 'grant-milestone':
      if (!isMissionMilestoneId(effect.request.milestoneId)) {
        return serviceError(
          'invalid-input',
          'That reward is not one of the four mission milestones.',
        )
      }
      return null
    case 'unlock-discovery':
      if (!isStableKey(effect.request.discoveryId)) {
        return serviceError(
          'invalid-input',
          'Discovery ids use lowercase letters, numbers, and hyphens.',
        )
      }
      return null
    case 'complete-mission':
      return null
  }
}

function effectKey(effect: EngineEffect): string {
  switch (effect.type) {
    case 'save-checkpoint':
      return [
        'save',
        effect.input.missionId,
        effect.input.checkpointId,
        effect.input.completedCheckpointId ?? '',
      ].join(':')
    case 'grant-milestone':
      return `grant:${effect.request.missionId}:${effect.request.milestoneId}`
    case 'unlock-discovery':
      return `discovery:${effect.request.missionId}:${effect.request.discoveryId}`
    case 'complete-mission':
      return `complete:${effect.event.missionId}`
  }
}
