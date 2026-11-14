import { useId } from 'react'
import type { CitationView } from '@/engine/sceneRenderers.ts'
import type { StoryScene } from '@/engine/scenes.ts'
import { SceneFrame } from '@/engine/scenes/SceneFrame.tsx'

export function StorySceneView({
  scene,
  citation,
}: {
  scene: StoryScene
  citation: CitationView
}) {
  const headingId = useId()

  return (
    <SceneFrame
      headingId={headingId}
      heading={scene.title}
      body={scene.body}
      emptyText="This story scene has no text yet."
      instruction={scene.instruction}
      media={scene.media}
      citation={citation}
      requestedSourceCount={scene.sourceIds.length}
      framing={scene.framing}
    />
  )
}
