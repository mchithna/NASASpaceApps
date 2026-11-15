/**
 * Mission player frame.
 * Phase 4B mounts this at `/missions/:missionId/play`. This file does not
 * choose a route or talk to auth.
 */

import { useRef, useState } from 'react'
import type { ActivityCompletionEvent } from '@/contracts/missions.ts'
import type { MissionRuntimeState } from '@/contracts/missions.ts'
import { serviceError } from '@/contracts/result.ts'
import { Button } from '@/components/ui/Button.tsx'
import { Card, CardBody, CardFooter } from '@/components/ui/Card.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { PageHeader } from '@/components/ui/PageHeader.tsx'
import { ProgressBar } from '@/components/ui/ProgressBar.tsx'
import { textLinkClass } from '@/components/layout/layoutClasses.ts'
import type { DiscoveryUnlockRequest } from '@/contracts/rewards.ts'
import { achievementCatalog } from '@/contracts/rewards.ts'
import {
  createActivityRegistry,
  defineActivity,
  validateActivityBindings,
  type ActivityRegistry,
  type ActivityRegistration,
  type ActivityRenderProps,
} from '@/engine/activityRegistry.ts'
import type { EngineServices } from '@/engine/checkpointAdapter.ts'
import { createServiceRuntime } from '@/engine/serviceRuntime.ts'
import type { EngineIssue } from '@/engine/issues.ts'
import {
  openModule,
  reduceNavigation,
  runtimeStateFromPosition,
  sceneNavigationState,
  type EnginePosition,
  type NavigationAction,
} from '@/engine/navigation.ts'
import type { MissionModule } from '@/engine/scenes.ts'
import { sceneActivity, sceneFramingLabels } from '@/engine/scenes.ts'
import { SceneAttribution } from '@/engine/scenes/SceneAttribution.tsx'
import { SceneMediaView } from '@/engine/scenes/SceneMediaView.tsx'
import {
  citationViewFor,
  renderScene,
  type CitationView,
  type SceneRendererRegistry,
} from '@/engine/sceneRenderers.ts'
import { builtinActivityRegistrations } from '@/engine/activities/builtinActivities.tsx'
import { TypedSceneView } from '@/engine/scenes/TypedSceneView.tsx'
import type { EndingSceneAction } from '@/engine/scenes/EndingSceneView.tsx'
import { safeExternalUrl } from '@/engine/scenes/urls.ts'
import {
  createTrainingRuntime,
  type MissionRuntimeAdapter,
} from '@/engine/trainingRuntime.ts'

export type MissionPlayerPhase = 'invalid' | 'ready' | 'saving' | 'error'

export type MissionPlayerProps = {
  /** Phase 1 metadata plus the ordered scene list. */
  module: MissionModule
  /**
   * Local or future persistence. When omitted, effects stay in a training
   * runtime for this visit. Phase 4B can pass `services` instead.
   */
  runtime?: MissionRuntimeAdapter
  /** Progress and rewards. Used only when `runtime` is omitted. */
  services?: EngineServices
  /** Null or omitted starts a new visit. */
  progress?: MissionRuntimeState | null
  sceneRenderers?: SceneRendererRegistry
  activities?: ActivityRegistry
  /** Phase 4B decides where Exit goes. This component does not change routes. */
  onExit?: () => void
  onRuntimeChange?: (state: MissionRuntimeState) => void
  onActivityComplete?: (event: ActivityCompletionEvent) => void
  /** Discovery scenes report this. The player does not grant XP from it. */
  onDiscoveryRequest?: (request: DiscoveryUnlockRequest) => void
  /** Ending scenes report this. The player does not grant XP from it. */
  onEnding?: (action: EndingSceneAction) => void
}

const trainingActivities = createActivityRegistry([
  ...builtinActivityRegistrations,
  defineActivity(
    'fixture-check',
    function TrainingActivity(props: ActivityRenderProps) {
      return (
        <Button
          variant="secondary"
          disabled={props.completed || props.replay}
          onClick={props.onComplete}
        >
          Finish activity
        </Button>
      )
    },
  ),
])

export function MissionPlayer(props: MissionPlayerProps) {
  const sessionKey = [
    props.module.mission.id,
    props.module.scenes.map((scene) => scene.id).join('|'),
    progressIdentity(props.progress ?? null),
    (props.activities ?? defaultActivities()).activityTypes.join('|'),
  ].join('::')

  return <MissionPlayerSession key={sessionKey} {...props} />
}

function MissionPlayerSession({
  module,
  runtime,
  services,
  progress = null,
  sceneRenderers,
  activities,
  onExit,
  onRuntimeChange,
  onActivityComplete,
  onDiscoveryRequest,
  onEnding,
}: MissionPlayerProps) {
  const activityRegistry = activities ?? defaultActivities()
  const usingDefaultRenderers = sceneRenderers === undefined
  const renderers = sceneRenderers ?? defaultSceneRenderers
  const opened = openModule(module, progress)
  const bindingIssues = opened.ok
    ? validateActivityBindings(module.scenes, activityRegistry)
    : []
  const issues = opened.ok ? bindingIssues : opened.issues
  const initialPosition =
    opened.ok && bindingIssues.length === 0 ? opened.value : null
  const playable = initialPosition !== null
  const [position, setPosition] = useState<EnginePosition | null>(
    initialPosition,
  )
  const positionRef = useRef(position)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [savedNotice, setSavedNotice] = useState(false)
  const [fallbackRuntime] = useState(() =>
    services
      ? createServiceRuntime(services)
      : import.meta.env.DEV
        ? createTrainingRuntime()
        : {
            apply: async () =>
              serviceError(
                'unavailable',
                'Mission services are not connected. Reload your saved place.',
              ),
          },
  )
  const adapter = runtime ?? fallbackRuntime
  const [activityGuard] = useState(createActivityCompletionGuard)

  function run(action: NavigationAction): boolean {
    if (!positionRef.current || !playable || savingRef.current) {
      return false
    }

    const result = reduceNavigation(module, positionRef.current, action)
    if (!result.ok) {
      setErrorMessage(
        result.issues[0]?.message ?? 'That action is not available.',
      )
      return false
    }

    const next = result.value
    setErrorMessage(null)
    setSavedNotice(false)

    if (next.effects.length === 0) {
      positionRef.current = next.position
      setPosition(next.position)
      onRuntimeChange?.(runtimeStateFromPosition(next.position))
      return true
    }

    savingRef.current = true
    setSaving(true)

    void adapter
      .apply(next.effects)
      .then((applied) => {
        savingRef.current = false
        setSaving(false)

        if (!applied.ok) {
          if (action.type === 'complete' && action.activityComplete) {
            activityGuard.release()
          }
          setErrorMessage(applied.error.message)
          return
        }

        positionRef.current = next.position
        setPosition(next.position)
        setSavedNotice(true)
        onRuntimeChange?.(runtimeStateFromPosition(next.position))
        if (next.activityCompletion) {
          onActivityComplete?.(next.activityCompletion)
        }
      })
      .catch(() => {
        savingRef.current = false
        setSaving(false)
        if (action.type === 'complete' && action.activityComplete) {
          activityGuard.release()
        }
        setErrorMessage('The mission could not be saved. Try again.')
      })

    return true
  }

  function completeCurrentActivity(sceneId: string): void {
    if (positionRef.current?.sceneId !== sceneId) return
    if (!activityGuard.claim(sceneId)) {
      return
    }

    if (!run({ type: 'complete', activityComplete: true })) {
      activityGuard.release()
    }
  }

  const scene =
    position?.sceneId == null
      ? null
      : (module.scenes.find((item) => item.id === position.sceneId) ?? null)
  const replay = position?.status === 'completed'
  const navigation =
    position === null ? null : sceneNavigationState(module, position)
  const citation =
    scene === null ? null : citationViewFor(module.mission, scene)
  const activityScene = scene ? sceneActivity(scene) : null
  const activityNode =
    scene && activityScene ? (
      <RegisteredActivity
        registration={activityRegistry.lookup(activityScene.activityType)}
        activityProps={{
          missionId: module.mission.id,
          sceneId: scene.id,
          activityId: activityScene.activityId,
          activityType: activityScene.activityType,
          config: activityScene.config,
          prompt: activityScene.prompt,
          completed: position?.completedSceneIds.includes(scene.id) ?? false,
          replay,
          onComplete: () => completeCurrentActivity(scene.id),
        }}
      />
    ) : null
  const sceneNode =
    scene && position
      ? renderScene(renderers, {
          mission: module.mission,
          scene,
          citation: citationViewFor(module.mission, scene),
          position,
          replay,
          activity: activityNode,
          onDiscoveryRequest,
          onEnding,
        })
      : null
  const phase: MissionPlayerPhase = !playable
    ? 'invalid'
    : saving
      ? 'saving'
      : errorMessage
        ? 'error'
        : 'ready'
  const controlsDisabled = !playable || saving || navigation === null

  return (
    <section className="flex flex-col gap-6" aria-busy={saving || undefined}>
      <PageHeader
        title={module.mission.chapterTitle}
        description={module.mission.displayName}
        actions={
          onExit ? (
            <Button variant="ghost" onClick={onExit}>
              Exit mission
            </Button>
          ) : null
        }
      />

      {phase === 'invalid' ? (
        <ErrorState
          title="This mission cannot be played"
          message={issueMessage(issues)}
        />
      ) : null}

      {playable && navigation ? (
        <Card>
          <CardBody className="flex flex-col gap-4">
            <h2
              className="font-heading text-2xl font-semibold text-foreground"
              aria-live="polite"
            >
              {scene?.title ?? 'Ready to start'}
            </h2>
            {phase === 'saving' ? (
              <LoadingState label="Saving your place" />
            ) : null}
            {phase === 'error' && errorMessage ? (
              <ErrorState title="Try that again" message={errorMessage} />
            ) : null}
            {phase === 'ready' && savedNotice ? (
              <p role="status" className="text-sm text-secondary">
                Your place is saved.
              </p>
            ) : null}
            {sceneNode}
            {scene?.kind !== 'activity' ? activityNode : null}
            {replay ? (
              <div
                role="status"
                className="rounded-surface border border-border bg-elevated p-4 text-foreground"
              >
                <p className="font-heading text-xl">Chapter complete</p>
                <p>
                  {
                    achievementCatalog.find(
                      (item) => item.id === module.mission.achievementId,
                    )?.title
                  }{' '}
                  unlocked. Your chapter progress and rewards are saved.
                  Replaying adds no duplicate XP.
                </p>
              </div>
            ) : null}
            {!scene ? (
              <p className="max-w-[65ch] text-secondary">
                Start the mission to open the first scene.
              </p>
            ) : null}
            <ProgressBar
              label="Scene progress"
              value={navigation.progressValue}
              max={navigation.progressMax}
              valueLabel={navigation.progressLabel}
            />
            {citation && !usingDefaultRenderers ? (
              <SourceList citation={citation} />
            ) : null}
          </CardBody>
          <CardFooter>
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              disabled={controlsDisabled || !navigation.canGoBack}
              onClick={() => run({ type: 'previous' })}
            >
              Back
            </Button>
            <Button
              className="w-full sm:w-auto"
              disabled={controlsDisabled || !navigation.canGoNext}
              onClick={() => run({ type: 'next' })}
            >
              Next
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              disabled={controlsDisabled || !navigation.canContinue}
              onClick={() => run({ type: 'complete' })}
            >
              Continue
            </Button>
            {position?.status === 'not_started' ? (
              <Button
                className="w-full sm:w-auto"
                disabled={saving}
                onClick={() => run({ type: 'start' })}
              >
                Start
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                disabled={controlsDisabled || !navigation.canRestart}
                onClick={() => run({ type: 'restart' })}
              >
                Start again
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : null}
    </section>
  )
}

function RegisteredActivity({
  registration,
  activityProps,
}: {
  registration: ActivityRegistration | undefined
  activityProps: ActivityRenderProps
}) {
  return registration?.render(activityProps) ?? null
}

function SourceList({ citation }: { citation: CitationView }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-base font-medium text-foreground">Sources</h3>
      <p className="text-sm text-secondary">{citation.label}</p>
      {citation.sources.length === 0 ? (
        <p className="text-sm text-secondary">
          This scene does not cite a NASA source.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {citation.sources.map((source) => {
            const href = safeExternalUrl(source.url)
            return (
              <li key={source.id}>
                {href ? (
                  <a
                    className={textLinkClass}
                    href={href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {source.title}
                  </a>
                ) : (
                  <span className="text-sm text-foreground">
                    {source.title}
                  </span>
                )}
                {source.credit ? (
                  <span className="text-sm text-muted"> {source.credit}</span>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

const defaultSceneRenderers: SceneRendererRegistry = {
  story: (context) => (
    <TypedSceneView
      missionId={context.mission.id}
      scene={context.scene}
      citation={context.citation}
      onUnlockRequest={context.onDiscoveryRequest}
      onEnding={context.onEnding}
    />
  ),
  evidence: (context) => (
    <TypedSceneView
      missionId={context.mission.id}
      scene={context.scene}
      citation={context.citation}
      onUnlockRequest={context.onDiscoveryRequest}
      onEnding={context.onEnding}
    />
  ),
  activity: (context) => (
    <div className="flex flex-col gap-3">
      {context.scene.instruction ? (
        <p className="text-secondary">{context.scene.instruction}</p>
      ) : null}
      {context.activity}
      <SceneMediaView media={context.scene.media} />
      <SceneAttribution
        citation={context.citation}
        requestedSourceCount={context.scene.sourceIds.length}
        framing={
          context.scene.framing
            ? sceneFramingLabels[context.scene.framing]
            : undefined
        }
      />
    </div>
  ),
  discovery: (context) => (
    <TypedSceneView
      missionId={context.mission.id}
      scene={context.scene}
      citation={context.citation}
      onUnlockRequest={context.onDiscoveryRequest}
      onEnding={context.onEnding}
    />
  ),
  ending: (context) => (
    <TypedSceneView
      missionId={context.mission.id}
      scene={context.scene}
      citation={context.citation}
      onUnlockRequest={context.onDiscoveryRequest}
      onEnding={context.onEnding}
    />
  ),
}

function defaultActivities(): ActivityRegistry {
  if (!trainingActivities.ok) {
    return { activityTypes: [], lookup: () => undefined }
  }

  return trainingActivities.value
}

function createActivityCompletionGuard(): {
  claim: (sceneId: string) => boolean
  release: () => void
} {
  let sceneId: string | null = null

  return {
    claim(next) {
      if (sceneId === next) {
        return false
      }

      sceneId = next
      return true
    },
    release() {
      sceneId = null
    },
  }
}

function issueMessage(issues: readonly EngineIssue[]): string {
  return issues[0]?.message ?? 'This mission cannot be played.'
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
