/**
 * Closed renderer map for the five scene kinds.
 * The engine supplies citation data. The host supplies the visible components.
 */

import { type ReactNode } from 'react'
import type { MissionDefinition, MissionSource } from '@/missions/types.ts'
import type { EnginePosition } from '@/engine/navigation.ts'
import {
  narrationLabels,
  type EngineScene,
  type NarrationKind,
  type SceneKind,
} from '@/engine/scenes.ts'

export type CitationView = {
  narration: NarrationKind
  /** Visible words. Do not replace this label with color alone. */
  label: string
  sources: readonly MissionSource[]
}

export type SceneRenderContext<TScene extends EngineScene = EngineScene> = {
  mission: MissionDefinition
  scene: TScene
  citation: CitationView
  position: EnginePosition
  replay: boolean
  /** Rendered activity, or null when this scene is not an activity. */
  activity: ReactNode | null
}

export type SceneRendererRegistry = {
  [Kind in SceneKind]: (
    context: SceneRenderContext<Extract<EngineScene, { kind: Kind }>>,
  ) => ReactNode
}

export function citationViewFor(
  mission: MissionDefinition,
  scene: Pick<EngineScene, 'narration' | 'sourceIds'>,
): CitationView {
  const sources = scene.sourceIds.flatMap((sourceId) => {
    const source = mission.sources.find((item) => item.id === sourceId)
    return source ? [source] : []
  })

  return {
    narration: scene.narration,
    label: narrationLabels[scene.narration],
    sources,
  }
}

export function renderScene(
  registry: SceneRendererRegistry,
  context: SceneRenderContext,
): ReactNode {
  switch (context.scene.kind) {
    case 'story':
      return registry.story({ ...context, scene: context.scene })
    case 'evidence':
      return registry.evidence({ ...context, scene: context.scene })
    case 'activity':
      return registry.activity({ ...context, scene: context.scene })
    case 'discovery':
      return registry.discovery({ ...context, scene: context.scene })
    case 'ending':
      return registry.ending({ ...context, scene: context.scene })
  }
}
