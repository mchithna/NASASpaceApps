import { useId } from 'react'
import type { CitationView } from '@/engine/sceneRenderers.ts'
import type { EvidenceScene } from '@/engine/scenes.ts'
import { SceneFrame } from '@/engine/scenes/SceneFrame.tsx'

export function EvidenceSceneView({
  scene,
  citation,
}: {
  scene: EvidenceScene
  citation: CitationView
}) {
  const headingId = useId()

  return (
    <SceneFrame
      headingId={headingId}
      heading={scene.title}
      body={scene.body}
      emptyText="This evidence scene has no text yet."
      instruction={
        scene.instruction ??
        'Read the scene, then open a source if one is listed.'
      }
      media={scene.media}
      citation={citation}
      requestedSourceCount={scene.sourceIds.length}
      framing={scene.framing}
    />
  )
}
