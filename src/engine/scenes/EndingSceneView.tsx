import { useId, useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import type { CitationView } from '@/engine/sceneRenderers.ts'
import type { EndingScene } from '@/engine/scenes.ts'
import type { MissionId } from '@/missions/types.ts'
import { SceneFrame } from '@/engine/scenes/SceneFrame.tsx'

/** What an ending scene reports. It does not carry XP or a checkpoint write. */
export type EndingSceneAction = {
  missionId: MissionId
  sceneId: string
}

export function EndingSceneView({
  missionId,
  scene,
  citation,
  onEnding,
}: {
  missionId: MissionId
  scene: EndingScene
  citation: CitationView
  onEnding: (action: EndingSceneAction) => void
}) {
  const headingId = useId()
  const [sent, setSent] = useState(false)

  return (
    <SceneFrame
      headingId={headingId}
      heading={scene.title}
      body={scene.body}
      emptyText="This ending has no text yet."
      instruction={
        scene.instruction ??
        'This ending is training narration. Finishing it here does not add points.'
      }
      media={scene.media}
      citation={citation}
      requestedSourceCount={scene.sourceIds.length}
      framing={scene.framing}
      action={
        scene.reward !== undefined ? undefined : (
          <div className="flex flex-col items-start gap-2">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                onEnding({ missionId, sceneId: scene.id })
                setSent(true)
              }}
            >
              Finish this scene
            </Button>
            {sent ? (
              <p role="status" className="max-w-[65ch] text-sm text-secondary">
                The finish request was sent for this visit. Points are not added
                here.
              </p>
            ) : null}
          </div>
        )
      }
    />
  )
}
