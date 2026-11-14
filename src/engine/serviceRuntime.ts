/**
 * Injected bridge from engine effects to ProgressService and RewardsService.
 * Phase 4B can pass real services here. This file does not import Supabase.
 * A confirmed write is not sent again. A failed write stays retryable.
 */

import { isStableKey } from '@/contracts/ids.ts'
import { runtimeStateFromProgress } from '@/contracts/missions.ts'
import type { MissionRuntimeState } from '@/contracts/missions.ts'
import { serviceError, serviceOk, type ServiceResult } from '@/contracts/result.ts'
import { isMissionMilestoneId } from '@/contracts/rewards.ts'
import type { MissionId } from '@/missions/types.ts'
import { applyEffects, type EngineServices } from '@/engine/checkpointAdapter.ts'
import type { EngineEffect } from '@/engine/navigation.ts'
import type { MissionRuntimeAdapter } from '@/engine/trainingRuntime.ts'

export type ServiceRuntime = MissionRuntimeAdapter & {
  /**
   * Reads the checkpoint stored on this service instance.
   * The mock keeps that state only until the instance is discarded.
   */
  loadProgress(
    missionId: MissionId,
  ): Promise<ServiceResult<MissionRuntimeState>>
}

export function createServiceRuntime(services: EngineServices): ServiceRuntime {
  const confirmed = new Set<string>()
  const inflight = new Map<string, Promise<ServiceResult<null>>>()

  return {
    apply(effects) {
      const pending = effects.filter((effect) => !confirmed.has(effectKey(effect)))
      if (pending.length === 0) {
        return Promise.resolve(serviceOk(null))
      }

      const signature = pending.map(effectKey).join('\n')
      const current = inflight.get(signature)
      if (current) {
        return current
      }

      const run = applyPending(services, pending, confirmed).finally(() => {
        inflight.delete(signature)
      })
      inflight.set(signature, run)
      return run
    },
    loadProgress(missionId) {
      return loadProgress(services, missionId)
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
): Promise<ServiceResult<null>> {
  for (const effect of effects) {
    const key = effectKey(effect)
    if (confirmed.has(key)) {
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
