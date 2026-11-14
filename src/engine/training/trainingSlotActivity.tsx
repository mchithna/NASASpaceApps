/**
 * Example custom activity for a future chapter package.
 *
 * A chapter file calls `defineActivity` with a stable activity type, then
 * passes `createActivityRegistry([..., that registration])` to MissionPlayer.
 * MissionPlayer, the router, and the five mission packages stay unchanged.
 */

import { Button } from '@/components/ui/Button.tsx'
import {
  createActivityRegistry,
  defineActivity,
  type ActivityRegistry,
  type ActivityRenderProps,
} from '@/engine/activityRegistry.ts'
import { builtinActivityRegistrations } from '@/engine/activities/builtinActivities.tsx'
import type { EngineResult } from '@/engine/issues.ts'

export type TrainingSlotConfig = {
  label: string
}

export const trainingSlotActivity = defineActivity<TrainingSlotConfig>(
  'training-slot',
  function TrainingSlotActivity(props: ActivityRenderProps & { config: TrainingSlotConfig }) {
    const done = props.completed || props.replay

    return (
      <div className="flex flex-col gap-3">
        <p className="max-w-[65ch] text-secondary">{props.config.label}</p>
        <p className="max-w-[65ch] text-secondary">
          This practice slot is not a NASA task.
        </p>
        <Button
          variant="secondary"
          className="w-full sm:w-auto"
          disabled={done}
          onClick={props.onComplete}
        >
          Mark the practice slot done
        </Button>
        {done ? (
          <p role="status" className="max-w-[65ch] text-sm text-secondary">
            The practice slot is marked. This does not describe a NASA result.
          </p>
        ) : null}
      </div>
    )
  },
)

/** Built-in activities plus the sample chapter slot. */
export function createTrainingActivities(): EngineResult<ActivityRegistry> {
  return createActivityRegistry([
    ...builtinActivityRegistrations,
    trainingSlotActivity,
  ])
}
