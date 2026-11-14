/**
 * Builder A — Phase 2: Player Systems exports.
 * Provides unified NovaServices adapter and individual service factories.
 */

import type { NovaServices } from '@/contracts/index.ts'
import { createAuthService } from './auth/authService.ts'
import { getSupabaseClient, type SupabaseClient } from './auth/supabaseClient.ts'
import { createExplorerService } from './profiles/explorerService.ts'
import { createProgressService } from './progress/progressService.ts'
import { createRewardsService } from './achievements/rewardsService.ts'

export { createAuthService } from './auth/authService.ts'
export { getSupabaseClient, SupabaseClient } from './auth/supabaseClient.ts'
export { createExplorerService } from './profiles/explorerService.ts'
export { createProgressService } from './progress/progressService.ts'
export { createRewardsService } from './achievements/rewardsService.ts'

export type PlayerServicesOptions = {
  client?: SupabaseClient
  clock?: () => string
}

/**
 * Creates the complete four-service NovaServices bundle for Phase 2.
 */
export function createPlayerServices(options: PlayerServicesOptions = {}): NovaServices {
  const client = options.client ?? getSupabaseClient()
  const clock = options.clock

  const auth = createAuthService({ client })
  const explorer = createExplorerService({ auth, client, clock })
  const rewards = createRewardsService({ auth, client, clock })
  const progress = createProgressService({ auth, rewards, client, clock })

  return {
    auth,
    explorer,
    progress,
    rewards,
  }
}
