/**
 * In-memory runtime for the training fixture.
 * It accepts engine effects and does not call auth, Supabase, or the network.
 */

import type { ServiceResult } from '@/contracts/result.ts'
import { serviceOk } from '@/contracts/result.ts'
import type { EngineEffect } from '@/engine/navigation.ts'

export type MissionRuntimeAdapter = {
  apply(effects: readonly EngineEffect[]): Promise<ServiceResult<null>>
}

export function createTrainingRuntime(): MissionRuntimeAdapter & {
  readonly applied: readonly EngineEffect[]
} {
  const applied: EngineEffect[] = []

  return {
    applied,
    async apply(effects) {
      applied.push(...effects)
      return serviceOk(null)
    },
  }
}
