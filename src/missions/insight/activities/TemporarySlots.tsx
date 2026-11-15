import { Button } from '@/components/ui/Button.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'

/**
 * TEMPORARY story gates for Prompts 03 and 04.
 * They are not finished scientific activities. Each later prompt replaces one.
 * The explanation text is sourced; the button only lets the chapter continue.
 */
function TemporarySlot({
  explanation,
  notice,
  action,
  props,
}: {
  explanation: string
  notice: string
  action: string
  props: ActivityRenderProps
}) {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="max-w-[65ch] text-secondary">{explanation}</p>
      <p className="max-w-[65ch] text-sm text-secondary">{notice}</p>
      <Button
        onClick={() => props.onComplete()}
        disabled={props.completed || props.replay}
      >
        {action}
      </Button>
    </div>
  )
}

/** Replaced in Prompt 04 by Seismometer Deployment. */
export function DeploymentSlot(props: ActivityRenderProps) {
  return (
    <TemporarySlot
      props={props}
      action="Mark deployment notes ready"
      notice="Activity not ready. This button does not place an instrument. It only continues the story."
      explanation="InSight’s robotic arm was more than 5 feet 9 inches (1.8 meters) long. It lifted SEIS off the deck and set the seismometer on the ground, under a wind and thermal shield. A steady spot and protection from wind and temperature swings matter, because the instrument is listening for very small vibrations."
    />
  )
}

/** Replaced in Prompt 03 by Mars Interior Discovery. */
export function InteriorSlot(props: ActivityRenderProps) {
  return (
    <TemporarySlot
      props={props}
      action="Mark interior notes ready"
      notice="Activity not ready. No interior diagram is shown yet. This button only continues the story."
      explanation="HP3, nicknamed the mole, was meant to hammer about 16 feet (5 meters) down and measure heat from inside Mars. The soil was clumpier than expected. Its 16-inch (40-centimeter) probe got only slightly below the surface. It still collected information about the soil, but not the deep heat-flow profile it was built for."
    />
  )
}

/** Replaced in Prompt 04 by the dust and solar-power demonstration. */
export function PowerSlot(props: ActivityRenderProps) {
  return (
    <TemporarySlot
      props={props}
      action="Mark power notes ready"
      notice="Activity not ready. These two NASA measurements are not a live power simulation. This button only continues the story."
      explanation="After landing, the solar panels produced roughly 5,000 watt-hours of energy each Martian day. By spring 2022, dust had reduced that to about 500 watt-hours. A watt-hour is a measure of energy. With less power, fewer instruments could stay on. SEIS was the last science instrument that remained powered."
    />
  )
}
