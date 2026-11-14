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
  isSceneFraming,
  isSceneKind,
  narrationKinds,
  narrationLabels,
  sceneFramingLabels,
  sceneFramings,
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
  type SceneFraming,
  type SceneKind,
  type SceneMedia,
  type StoryScene,
} from '@/engine/scenes.ts'

export {
  DiscoverySceneView,
  EndingSceneView,
  EvidenceSceneView,
  SceneAttribution,
  SceneMediaView,
  StorySceneView,
  TypedSceneView,
  safeExternalUrl,
  safeMediaSrc,
  type EndingSceneAction,
  type TypedSceneHandlers,
} from '@/engine/scenes/index.ts'

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
  sceneNavigationState,
  type EngineEffect,
  type EngineMilestoneId,
  type EnginePosition,
  type NavigationAction,
  type NavigationSuccess,
  type SceneNavigationState,
} from '@/engine/navigation.ts'

export {
  applyEffects,
  type EngineServices,
} from '@/engine/checkpointAdapter.ts'

export {
  createServiceRuntime,
  type ServiceRuntime,
} from '@/engine/serviceRuntime.ts'

export {
  createActivityRegistry,
  defineActivity,
  validateActivityBindings,
  type ActivityRegistration,
  type ActivityRegistry,
  type ActivityRenderProps,
} from '@/engine/activityRegistry.ts'

export { builtinActivityRegistrations } from '@/engine/activities/builtinActivities.tsx'

export type {
  ActivityPrompt,
  ActivityStep,
  EvidenceCard,
  EvidenceMatchPrompt,
  EvidenceMeaning,
  EventOrderPrompt,
  PredictionChoice,
  PredictionPrompt,
} from '@/engine/activities/prompts.ts'

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
  createTrainingRuntime,
  type MissionRuntimeAdapter,
} from '@/engine/trainingRuntime.ts'

export {
  createTrainingActivities,
  trainingSlotActivity,
  type TrainingSlotConfig,
} from '@/engine/training/trainingSlotActivity.tsx'

export {
  createTrainingSimulator,
  trainingSimulatorLabel,
} from '@/engine/training/trainingSimulator.ts'

export { TrainingSimulatorPreview } from '@/engine/training/TrainingSimulatorPreview.tsx'

export {
  MissionPlayer,
  type MissionPlayerPhase,
  type MissionPlayerProps,
} from '@/engine/MissionPlayer.tsx'
