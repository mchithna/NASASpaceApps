/**
 * Headless mission player.
 * It renders through host registries and does not provide academy chrome.
 */

import { useRef, useState, type ReactNode } from 'react'
import type { MissionRuntimeState } from '@/contracts/missions.ts'
import type { ActivityCompletionEvent } from '@/contracts/missions.ts'
import {
  validateActivityBindings,
  type ActivityRegistry,
} from '@/engine/activityRegistry.ts'
import type { EngineServices } from '@/engine/checkpointAdapter.ts'
import { applyEffects } from '@/engine/checkpointAdapter.ts'
import type { EngineIssue } from '@/engine/issues.ts'
import {
  openModule,
  reduceNavigation,
  runtimeStateFromPosition,
  type EnginePosition,
  type NavigationAction,
} from '@/engine/navigation.ts'
import type { EngineScene, MissionModule } from '@/engine/scenes.ts'
import {
  citationViewFor,
  renderScene,
  type CitationView,
  type SceneRendererRegistry,
} from '@/engine/sceneRenderers.ts'

export type MissionPlayerPhase = 'invalid' | 'ready' | 'saving' | 'error'

export type MissionPlayerView = {
  phase: MissionPlayerPhase
  issues: readonly EngineIssue[]
  position: EnginePosition | null
  scene: EngineScene | null
  citation: CitationView | null
  replay: boolean
  errorMessage: string | null
  sceneNode: ReactNode
  actions: {
    start: () => void
    complete: (options?: { activityComplete?: boolean }) => void
    next: () => void
    previous: () => void
    goTo: (sceneId: string) => void
  }
}

export type MissionPlayerProps = {
  module: MissionModule
  /** Progress and rewards only. Phase 4B passes the shared `NovaServices` object. */
  services: EngineServices
  /** Null starts a new visit. Phase 4B loads this from `progress.getMissionProgress`. */
  progress: MissionRuntimeState | null
  sceneRenderers: SceneRendererRegistry
  activities: ActivityRegistry
  onRuntimeChange?: (state: MissionRuntimeState) => void
  /** Fired after a newly completed activity has been saved. Not a service call. */
  onActivityComplete?: (event: ActivityCompletionEvent) => void
  children: (view: MissionPlayerView) => ReactNode
}

export function MissionPlayer(props: MissionPlayerProps) {
  const sessionKey = [
    props.module.mission.id,
    props.module.scenes.map((scene) => scene.id).join('|'),
    progressIdentity(props.progress),
    props.activities.activityTypes.join('|'),
  ].join('::')

  return <MissionPlayerSession key={sessionKey} {...props} />
}

function MissionPlayerSession({
  module,
  services,
  progress,
  sceneRenderers,
  activities,
  onRuntimeChange,
  onActivityComplete,
  children,
}: MissionPlayerProps) {
  const opened = openModule(module, progress)
  const bindingIssues = opened.ok
    ? validateActivityBindings(module.scenes, activities)
    : []
  const issues = opened.ok ? bindingIssues : opened.issues
  const initialPosition =
    opened.ok && bindingIssues.length === 0 ? opened.value : null
  const playable = initialPosition !== null
  const [position, setPosition] = useState<EnginePosition | null>(
    initialPosition,
  )
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const busy = useRef(false)

  function run(action: NavigationAction): void {
    if (!position || !playable || busy.current) {
      return
    }

    const result = reduceNavigation(module, position, action)
    if (!result.ok) {
      setErrorMessage(
        result.issues[0]?.message ?? 'That action is not available.',
      )
      return
    }

    const next = result.value
    setErrorMessage(null)

    if (next.effects.length === 0) {
      setPosition(next.position)
      onRuntimeChange?.(runtimeStateFromPosition(next.position))
      return
    }

    busy.current = true
    setSaving(true)

    void applyEffects(services, next.effects)
      .then((applied) => {
        busy.current = false
        setSaving(false)

        if (!applied.ok) {
          setErrorMessage(applied.error.message)
          return
        }

        setPosition(next.position)
        onRuntimeChange?.(runtimeStateFromPosition(next.position))
        if (next.activityCompletion) {
          onActivityComplete?.(next.activityCompletion)
        }
      })
      .catch(() => {
        busy.current = false
        setSaving(false)
        setErrorMessage('The mission could not be saved. Try again.')
      })
  }

  const scene =
    position?.sceneId === null || position === null
      ? null
      : (module.scenes.find((item) => item.id === position.sceneId) ?? null)
  const replay = position?.status === 'completed'
  const citation =
    scene === null ? null : citationViewFor(module.mission, scene)
  const activityNode =
    scene?.kind === 'activity'
      ? (activities.lookup(scene.activityType)?.render({
          missionId: module.mission.id,
          sceneId: scene.id,
          activityId: scene.activityId,
          activityType: scene.activityType,
          config: scene.config,
          completed: position?.completedSceneIds.includes(scene.id) ?? false,
          replay,
          onComplete: () => run({ type: 'complete', activityComplete: true }),
        }) ?? null)
      : null
  const sceneNode =
    scene && position
      ? renderScene(sceneRenderers, {
          mission: module.mission,
          scene,
          citation: citationViewFor(module.mission, scene),
          position,
          replay,
          activity: activityNode,
        })
      : null

  const phase: MissionPlayerPhase = !playable
    ? 'invalid'
    : saving
      ? 'saving'
      : errorMessage
        ? 'error'
        : 'ready'

  return children({
    phase,
    issues,
    position: playable ? position : null,
    scene: playable ? scene : null,
    citation: playable ? citation : null,
    replay,
    errorMessage,
    sceneNode: playable ? sceneNode : null,
    actions: {
      start: () => run({ type: 'start' }),
      complete: (options) =>
        run({
          type: 'complete',
          activityComplete: options?.activityComplete === true,
        }),
      next: () => run({ type: 'next' }),
      previous: () => run({ type: 'previous' }),
      goTo: (sceneId) => run({ type: 'go-to', sceneId }),
    },
  })
}

function progressIdentity(progress: MissionRuntimeState | null): string {
  if (!progress) {
    return 'new'
  }

  return [
    progress.missionId,
    progress.status,
    progress.currentCheckpointId ?? '',
    progress.completedCheckpointIds.join('|'),
  ].join(':')
}
