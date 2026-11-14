/**
 * Open registry for mission-specific activities.
 * Scene kinds stay closed. A new interaction registers an activity type.
 */

import { type ReactNode } from 'react'
import { isStableKey } from '@/contracts/ids.ts'
import type { MissionId } from '@/missions/types.ts'
import {
  engineIssue,
  type EngineIssue,
  type EngineResult,
} from '@/engine/issues.ts'
import {
  type ActivityConfig,
  type ActivityScene,
  type EngineScene,
} from '@/engine/scenes.ts'

export type ActivityRenderProps = {
  missionId: MissionId
  sceneId: string
  activityId: string
  activityType: string
  config: ActivityConfig
  /** Present for reusable activities. Custom activities may ignore it. */
  prompt?: ActivityScene['prompt']
  completed: boolean
  replay: boolean
  onComplete: () => void
}

export type ActivityRegistration = {
  activityType: string
  render: (props: ActivityRenderProps) => ReactNode
  /** Set for reusable activities. Custom registrations can omit it. */
  validatePrompt?: (
    scene: Pick<ActivityScene, 'id' | 'prompt'>,
  ) => readonly EngineIssue[]
}

export type ActivityRegistry = {
  activityTypes: readonly string[]
  lookup: (activityType: string) => ActivityRegistration | undefined
}

/**
 * Mission code uses this to keep a typed config at the registration boundary.
 * The engine checks that config values are plain, not that they match `TConfig`.
 */
export function defineActivity<TConfig extends ActivityConfig>(
  activityType: string,
  render: (props: ActivityRenderProps & { config: TConfig }) => ReactNode,
): ActivityRegistration {
  return {
    activityType,
    render: (props) => render({ ...props, config: props.config as TConfig }),
  }
}

export function createActivityRegistry(
  registrations: readonly ActivityRegistration[],
): EngineResult<ActivityRegistry> {
  const issues: EngineIssue[] = []
  const registrationsByType = new Map<string, ActivityRegistration>()

  for (const registration of registrations) {
    if (!isStableKey(registration.activityType)) {
      issues.push(
        engineIssue(
          'invalid-activity-type',
          null,
          'Activity types use lowercase letters, numbers, and hyphens.',
        ),
      )
      continue
    }

    if (registrationsByType.has(registration.activityType)) {
      issues.push(
        engineIssue(
          'duplicate-activity-type',
          null,
          'An activity type is registered more than once.',
        ),
      )
      continue
    }

    registrationsByType.set(registration.activityType, registration)
  }

  if (issues.length > 0) {
    return { ok: false, issues }
  }

  const activityTypes = [...registrationsByType.keys()]

  return {
    ok: true,
    value: {
      activityTypes,
      lookup(activityType: string) {
        return registrationsByType.get(activityType)
      },
    },
  }
}

export function validateActivityBindings(
  scenes: readonly EngineScene[],
  registry: ActivityRegistry,
): EngineIssue[] {
  const issues: EngineIssue[] = []
  const reported = new Set<string>()

  for (const scene of scenes) {
    if (scene.kind !== 'activity') {
      continue
    }

    const registration = registry.lookup(scene.activityType)
    if (!registration) {
      if (reported.has(scene.activityType)) {
        continue
      }

      reported.add(scene.activityType)
      issues.push(
        engineIssue(
          'unknown-activity',
          scene.id,
          'This activity type is not registered.',
        ),
      )
      continue
    }

    issues.push(...(registration.validatePrompt?.(scene) ?? []))
  }

  return issues
}
