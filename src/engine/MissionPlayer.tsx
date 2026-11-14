/**
 * Mission player frame.
 * Phase 4B mounts this at `/missions/:missionId/play`. This file does not
 * choose a route or talk to auth.
 */

import { useState } from 'react'
import type { ActivityCompletionEvent } from '@/contracts/missions.ts'
import type { MissionRuntimeState } from '@/contracts/missions.ts'
import { Button } from '@/components/ui/Button.tsx'
import { Card, CardBody, CardFooter } from '@/components/ui/Card.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { PageHeader } from '@/components/ui/PageHeader.tsx'
import { ProgressBar } from '@/components/ui/ProgressBar.tsx'
import { textLinkClass } from '@/components/layout/layoutClasses.ts'
import {
  createActivityRegistry,
  defineActivity,
  validateActivityBindings,
  type ActivityRegistry,
  type ActivityRenderProps,
} from '@/engine/activityRegistry.ts'
import { applyEffects, type EngineServices } from '@/engine/checkpointAdapter.ts'
import type { EngineIssue } from '@/engine/issues.ts'
import {
  openModule,
  reduceNavigation,
  runtimeStateFromPosition,
  sceneNavigationState,
  type EnginePosition,
  type NavigationAction,
} from '@/engine/navigation.ts'
import type { EngineScene, MissionModule } from '@/engine/scenes.ts'
import {
  citationViewFor,
  renderScene,
  type CitationView,
  type SceneRenderContext,
  type SceneRendererRegistry,
} from '@/engine/sceneRenderers.ts'
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
}

const trainingActivities = createActivityRegistry([
  defineActivity('fixture-check', function TrainingActivity(props: ActivityRenderProps) {
    return (
      <Button
        variant="secondary"
        disabled={props.completed || props.replay}
        onClick={props.onComplete}
      >
        Finish activity
      </Button>
    )
  }),
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
}: MissionPlayerProps) {
  const activityRegistry = activities ?? defaultActivities()
  const renderers = sceneRenderers ?? trainingSceneRenderers
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
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const adapter = runtime ?? servicesToRuntime(services)

  function run(action: NavigationAction): void {
    if (!position || !playable || saving) {
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

    setSaving(true)

    void adapter
      .apply(next.effects)
      .then((applied) => {
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
        setSaving(false)
        setErrorMessage('The mission could not be saved. Try again.')
      })
  }

  const scene =
    position?.sceneId == null
      ? null
      : (module.scenes.find((item) => item.id === position.sceneId) ?? null)
  const replay = position?.status === 'completed'
  const navigation =
    position === null ? null : sceneNavigationState(module, position)
  const citation = scene === null ? null : citationViewFor(module.mission, scene)
  const activityNode =
    scene?.kind === 'activity'
      ? (activityRegistry.lookup(scene.activityType)?.render({
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
      ? renderScene(renderers, {
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
            <h2 className="font-heading text-2xl font-semibold text-foreground" aria-live="polite">
              {scene?.title ?? 'Ready to start'}
            </h2>
            {phase === 'saving' ? (
              <LoadingState label="Saving your place" />
            ) : null}
            {phase === 'error' && errorMessage ? (
              <ErrorState title="Try that again" message={errorMessage} />
            ) : null}
            {sceneNode}
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
            {citation ? <SourceList citation={citation} /> : null}
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
          {citation.sources.map((source) => (
            <li key={source.id}>
              <a
                className={textLinkClass}
                href={source.url}
                rel="noreferrer"
                target="_blank"
              >
                {source.title}
              </a>
              {source.credit ? (
                <span className="text-sm text-muted"> {source.credit}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const trainingSceneRenderers: SceneRendererRegistry = {
  story: (context) => <SceneText context={context} />,
  evidence: (context) => <SceneText context={context} />,
  activity: (context) => context.activity,
  discovery: (context) => (
    <p className="max-w-[65ch] text-secondary">
      {context.scene.title} is saved with the training visit. It is not a NASA
      finding.
    </p>
  ),
  ending: (context) => <SceneText context={context} />,
}

function SceneText({
  context,
}: {
  context: SceneRenderContext<Extract<EngineScene, { body: string }>>
}) {
  return <p className="max-w-[65ch] text-pretty text-secondary">{context.scene.body}</p>
}

function defaultActivities(): ActivityRegistry {
  if (!trainingActivities.ok) {
    return { activityTypes: [], lookup: () => undefined }
  }

  return trainingActivities.value
}

function servicesToRuntime(services: EngineServices | undefined): MissionRuntimeAdapter {
  if (!services) {
    return createTrainingRuntime()
  }

  return {
    apply(effects) {
      return applyEffects(services, effects)
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
