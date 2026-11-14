/**
 * Public mission-engine API.
 * Architecture and Phase 4B seams: src/engine/ARCHITECTURE.md
 */

export {
  engineIssue,
  engineIssueCodes,
  type EngineIssue,
  type EngineIssueCode,
  type EngineResult,
} from '@/engine/issues.ts'

export {
  isNarrationKind,
  isSceneKind,
  narrationKinds,
  narrationLabels,
  sceneKinds,
  type ActivityConfig,
  type ActivityConfigValue,
  type ActivityScene,
  type DiscoveryScene,
  type EndingScene,
  type EngineScene,
  type EvidenceScene,
  type MissionModule,
  type NarrationKind,
  type SceneKind,
  type StoryScene,
} from '@/engine/scenes.ts'

export {
  validateResume,
  validateSceneSequence,
} from '@/engine/validateModule.ts'

export {
  createInitialPosition,
  openModule,
  reduceNavigation,
  resumePosition,
  runtimeStateFromPosition,
  type EngineEffect,
  type EngineMilestoneId,
  type EnginePosition,
  type NavigationAction,
  type NavigationSuccess,
} from '@/engine/navigation.ts'

export {
  applyEffects,
  type EngineServices,
} from '@/engine/checkpointAdapter.ts'

export {
  createActivityRegistry,
  defineActivity,
  validateActivityBindings,
  type ActivityRegistration,
  type ActivityRegistry,
  type ActivityRenderProps,
} from '@/engine/activityRegistry.ts'

export {
  citationViewFor,
  renderScene,
  type CitationView,
  type SceneRenderContext,
  type SceneRendererRegistry,
} from '@/engine/sceneRenderers.ts'

export {
  createStructuralFixture,
  structuralFixtureNotice,
} from '@/engine/fixture.ts'

export {
  MissionPlayer,
  type MissionPlayerPhase,
  type MissionPlayerProps,
  type MissionPlayerView,
} from '@/engine/MissionPlayer.tsx'
