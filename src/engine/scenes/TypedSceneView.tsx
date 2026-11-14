import type { ReactNode } from 'react'
import type { DiscoveryUnlockRequest } from '@/contracts/rewards.ts'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import type { CitationView } from '@/engine/sceneRenderers.ts'
import type { MissionId } from '@/missions/types.ts'
import { isSceneKind, type EngineScene } from '@/engine/scenes.ts'
import { DiscoverySceneView } from '@/engine/scenes/DiscoverySceneView.tsx'
import {
  EndingSceneView,
  type EndingSceneAction,
} from '@/engine/scenes/EndingSceneView.tsx'
import { EvidenceSceneView } from '@/engine/scenes/EvidenceSceneView.tsx'
import { StorySceneView } from '@/engine/scenes/StorySceneView.tsx'

export type TypedSceneHandlers = {
  onUnlockRequest?: (request: DiscoveryUnlockRequest) => void
  onEnding?: (action: EndingSceneAction) => void
}

function UnknownSceneFallback() {
  return (
    <ErrorState
      title="This scene cannot be shown"
      message="This scene type is not part of the player. Use Back or Continue when those controls are available."
    />
  )
}

function isEngineScene(
  scene: EngineScene | { kind: string },
): scene is EngineScene {
  return (
    isSceneKind(scene.kind) &&
    'id' in scene &&
    'title' in scene &&
    'narration' in scene &&
    'sourceIds' in scene
  )
}

export function TypedSceneView({
  missionId,
  scene,
  citation,
  activity,
  onUnlockRequest,
  onEnding,
}: {
  missionId: MissionId
  scene: EngineScene | { kind: string }
  citation: CitationView
  activity?: ReactNode
  onUnlockRequest?: (request: DiscoveryUnlockRequest) => void
  onEnding?: (action: EndingSceneAction) => void
}) {
  if (!isEngineScene(scene)) {
    return <UnknownSceneFallback />
  }

  switch (scene.kind) {
    case 'story':
      return <StorySceneView scene={scene} citation={citation} />
    case 'evidence':
      return <EvidenceSceneView scene={scene} citation={citation} />
    case 'activity':
      return (
        <div key={scene.id} className="flex flex-col gap-3">
          {activity ?? <UnknownSceneFallback />}
        </div>
      )
    case 'discovery':
      return (
        <DiscoverySceneView
          missionId={missionId}
          scene={scene}
          citation={citation}
          onUnlockRequest={onUnlockRequest ?? (() => undefined)}
        />
      )
    case 'ending':
      return (
        <EndingSceneView
          missionId={missionId}
          scene={scene}
          citation={citation}
          onEnding={onEnding ?? (() => undefined)}
        />
      )
  }
}
