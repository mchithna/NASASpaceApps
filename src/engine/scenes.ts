/**
 * Internal scene model for Phase 4A.
 * Scene ids are checkpoint ids. This file does not redefine `MissionDefinition`.
 */

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

export type ActivityConfigValue = string | number | boolean | null

/** Plain settings for a mission-specific activity. Nested objects are not supported. */
export type ActivityConfig = Readonly<Record<string, ActivityConfigValue>>

type SceneBase = {
  id: string
  title: string
  narration: NarrationKind
  /** Ids from `MissionDefinition.sources`. Not free-form URLs. */
  sourceIds: readonly string[]
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
}

export type DiscoveryScene = SceneBase & {
  kind: 'discovery'
  discoveryId: string
}

export type EndingScene = SceneBase & {
  kind: 'ending'
  body: string
}

export type EngineScene =
  | StoryScene
  | EvidenceScene
  | ActivityScene
  | DiscoveryScene
  | EndingScene

/**
 * A playable chapter. `mission` is the Phase 1 metadata object.
 * The registry does not store `scenes`.
 */
export type MissionModule = {
  mission: MissionDefinition
  scenes: readonly EngineScene[]
}

export function isSceneKind(value: string): value is SceneKind {
  return (sceneKinds as readonly string[]).includes(value)
}

export function isNarrationKind(value: string): value is NarrationKind {
  return (narrationKinds as readonly string[]).includes(value)
}
