/**
 * Turns engine effects into the Phase 1.5 service calls.
 * Arguments match the service signatures. XP is never sent.
 */

import type { NovaServices } from '@/contracts/services.ts'
import { serviceOk, type ServiceResult } from '@/contracts/result.ts'
import type { EngineEffect } from '@/engine/navigation.ts'

export type EngineServices = Pick<NovaServices, 'progress' | 'rewards'>

/**
 * Applies effects in order and stops on the first failure.
 * A failed reward therefore does not also mark the scene complete,
 * because the checkpoint effect is last. The ending is the exception:
 * its checkpoint is saved before `completeMission`.
 */
export async function applyEffects(
  services: EngineServices,
  effects: readonly EngineEffect[],
): Promise<ServiceResult<null>> {
  for (const effect of effects) {
    const result = await applyEffect(services, effect)
    if (!result.ok) {
      return result
    }
  }

  return serviceOk(null)
}

async function applyEffect(
  services: EngineServices,
  effect: EngineEffect,
): Promise<ServiceResult<null>> {
  switch (effect.type) {
    case 'save-checkpoint': {
      const saved = await services.progress.saveCheckpoint(effect.input)
      return saved.ok ? serviceOk(null) : saved
    }
    case 'grant-milestone': {
      const granted = await services.rewards.grantMilestone({
        missionId: effect.request.missionId,
        milestoneId: effect.request.milestoneId,
      })
      return granted.ok ? serviceOk(null) : granted
    }
    case 'unlock-discovery': {
      const unlocked = await services.rewards.unlockDiscovery({
        missionId: effect.request.missionId,
        discoveryId: effect.request.discoveryId,
      })
      return unlocked.ok ? serviceOk(null) : unlocked
    }
    case 'complete-mission': {
      const completed = await services.progress.completeMission({
        missionId: effect.event.missionId,
      })
      return completed.ok ? serviceOk(null) : completed
    }
  }
}
