/**
 * Internal scene model for Phase 4A.
 * Scene ids are checkpoint ids. This file does not redefine `MissionDefinition`.
 */

import type { ActivityPrompt } from '@/engine/activities/prompts.ts'
import type { MissionDefinition } from '@/missions/types.ts'

export const sceneKinds = [
  'story',
  'evidence',
  'activity',
  'discovery',
  'ending',
] as const

export type SceneKind = (typeof sceneKinds)[number]

export const narrationKinds = ['academy', 'factual', 'mixed'] as const

export type NarrationKind = (typeof narrationKinds)[number]

/** Text a renderer must show so academy narration is not mistaken for a NASA source. */
export const narrationLabels = {
  academy: 'Academy narration',
  factual: 'NASA source',
  mixed: 'Academy narration and NASA source',
} as const satisfies Record<NarrationKind, string>

/**
 * Extra reading label for a scene. This is not a NASA quotation mark.
 * `factual` still needs a source link from the mission definition.
 */
export const sceneFramings = ['factual', 'hypothetical', 'simulation'] as const

export type SceneFraming = (typeof sceneFramings)[number]

export const sceneFramingLabels = {
  factual: 'Factual',
  hypothetical: 'Hypothetical',
  simulation: 'Simulation',
} as const satisfies Record<SceneFraming, string>

/** Optional picture. `src` is shown only after it passes the address check. */
export type SceneMedia = {
  src: string
  alt: string
  credit?: string
}

export type ActivityConfigValue = string | number | boolean | null

/** Plain settings for a mission-specific activity. Nested objects are not supported. */
export type ActivityConfig = Readonly<Record<string, ActivityConfigValue>>

type SceneBase = {
  id: string
  title: string
  narration: NarrationKind
  /** Ids from `MissionDefinition.sources`. Not free-form URLs. */
  sourceIds: readonly string[]
  /** Short direction for this scene. Omit it when the scene has none. */
  instruction?: string
  /** `null` means the scene expected a picture and does not have one. */
  media?: SceneMedia | null
  framing?: SceneFraming
  /** Explicit chapter reward checkpoints; omit on all scenes for legacy defaults. */
  reward?: 'introduction' | 'activity' | 'discovery' | null
  /** Optional investigation inside a story, evidence, or discovery scene. */
  interaction?: {
    activityId: string
    activityType: string
    config: ActivityConfig
    prompt?: ActivityPrompt
  }
}

export type StoryScene = SceneBase & {
  kind: 'story'
  body: string
}

export type EvidenceScene = SceneBase & {
  kind: 'evidence'
  body: string
}

export type ActivityScene = SceneBase & {
  kind: 'activity'
  activityId: string
  /** Open type key. The activity registry maps it to a mission component. */
  activityType: string
  config: ActivityConfig
  /**
   * Structured content for a reusable activity.
   * Custom activities can omit this and use `config`.
   */
  prompt?: ActivityPrompt
}

export type DiscoveryScene = SceneBase & {
  kind: 'discovery'
  discoveryId: string
  /** Training or mission explanation. Omit it when the scene has none. */
  body?: string
}

export type EndingScene = SceneBase & {
  kind: 'ending'
  body: string
}

export type EngineScene =
  StoryScene | EvidenceScene | ActivityScene | DiscoveryScene | EndingScene

/**
 * A playable chapter. `mission` is the Phase 1 metadata object.
 * The registry does not store `scenes`.
 */
export type MissionModule = {
  mission: MissionDefinition
  scenes: readonly EngineScene[]
}

export function sceneActivity(scene: EngineScene): ActivityScene | null {
  if (scene.kind === 'activity') return scene
  return scene.interaction
    ? { ...scene, ...scene.interaction, kind: 'activity' }
    : null
}

export function rewardScene(
  module: MissionModule,
  milestone: string,
): EngineScene | undefined {
  if (module.scenes.some((scene) => scene.reward !== undefined)) {
    return module.scenes.find((scene) => scene.reward === milestone)
  }
  const kind = milestone === 'introduction' ? 'story' : milestone
  return module.scenes.find((scene) => scene.kind === kind)
}

export function isSceneKind(value: string): value is SceneKind {
  return (sceneKinds as readonly string[]).includes(value)
}

export function isNarrationKind(value: string): value is NarrationKind {
  return (narrationKinds as readonly string[]).includes(value)
}

export function isSceneFraming(value: string): value is SceneFraming {
  return (sceneFramings as readonly string[]).includes(value)
}
