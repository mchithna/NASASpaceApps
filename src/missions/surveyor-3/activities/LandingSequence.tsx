import { useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import { EventOrderActivity } from '@/engine/activities/EventOrderActivity.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'

export function LandingSequence(props: ActivityRenderProps) {
  const [solved, setSolved] = useState(false)
  return (
    <div className="flex flex-col gap-3">
      <EventOrderActivity
        {...props}
        completed={props.completed && !props.replay}
        replay={false}
        onComplete={() => {
          setSolved(true)
          if (!props.replay) props.onComplete()
        }}
      />
      {solved && !props.completed && !props.replay ? (
        <Button variant="secondary" onClick={props.onComplete}>
          Retry saving sequence
        </Button>
      ) : null}
    </div>
  )
}
