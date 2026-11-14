import { useId, useState } from 'react'
import type { DiscoveryUnlockRequest } from '@/contracts/rewards.ts'
import { Button } from '@/components/ui/Button.tsx'
import type { CitationView } from '@/engine/sceneRenderers.ts'
import type { DiscoveryScene } from '@/engine/scenes.ts'
import { SceneFrame } from '@/engine/scenes/SceneFrame.tsx'

export function DiscoverySceneView({
  missionId,
  scene,
  citation,
  onUnlockRequest,
}: {
  missionId: string
  scene: DiscoveryScene
  citation: CitationView
  onUnlockRequest: (request: DiscoveryUnlockRequest) => void
}) {
  const headingId = useId()
  const [sent, setSent] = useState(false)

  return (
    <SceneFrame
      headingId={headingId}
      heading={scene.title}
      body={
        scene.body ??
        'This training note explains a discovery id. It is not a NASA finding.'
      }
      emptyText="This discovery has no explanation yet."
      instruction={
        scene.instruction ??
        'Ask to save the discovery id. This button does not add points.'
      }
      media={scene.media}
      citation={citation}
      requestedSourceCount={scene.sourceIds.length}
      framing={scene.framing}
      action={
        <div className="flex flex-col items-start gap-2">
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => {
              onUnlockRequest({
                missionId,
                discoveryId: scene.discoveryId,
              })
              setSent(true)
            }}
          >
            Ask to save this discovery
          </Button>
          {sent ? (
            <p role="status" className="max-w-[65ch] text-sm text-secondary">
              The discovery request was sent for this visit. Points are not added
              here.
            </p>
          ) : null}
        </div>
      }
    />
  )
}
