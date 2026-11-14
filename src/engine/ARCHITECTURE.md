# Mission engine architecture

Phase 4A design for the shared mission player. This note is engine-owned. It does not change `src/contracts/`, the mission registry, or the app shell.

The player renders its own frame and is not mounted in the router. Phase 4B places it at `/missions/:missionId/play`. When no runtime is passed, effects stay in a training adapter for that visit.

## Contracts this engine consumes

The engine imports these types and does not redefine them.

| Contract | Use |
| --- | --- |
| `MissionId`, `MissionDefinition`, `MissionSource` | Chapter metadata and citation records. `lookupMission` supplies the fixture's mission object. |
| `isStableKey` | Scene, activity, activity-type, and discovery ids. |
| `MissionRuntimeState`, `runtimeStateFromProgress` | Resume input. The player can also build this shape with `runtimeStateFromPosition`. |
| `MissionProgressStatus`, `SaveCheckpointInput` | Checkpoint writes. |
| `ActivityCompletionEvent` | Local notice when an activity scene is newly completed. No service accepts it. |
| `MissionCompletionEvent` | Local notice. `completeMission` receives only `{ missionId }`. |
| `MilestoneCompletionRequest` | Local notice. `grantMilestone` receives only `{ missionId, milestoneId }`. |
| `DiscoveryUnlockRequest` | `{ missionId, discoveryId }` only. Title and summary are not sent. |
| `MissionMilestoneId` | The engine grants `introduction`, `activity`, and `discovery`. `legacy` is excluded from engine grants. |
| `NovaServices` | The player needs `progress` and `rewards` only. |
| `ServiceResult` | Failed writes stop the effect list. The player keeps the previous scene. |

`milestoneXp` is not imported by the engine. Callers never send an XP amount.

## Conflicts and missing hooks

These are absorbed inside `src/engine/`. They are not a request to fork the shared types.

1. `MissionDefinition` has no scenes. A `MissionModule` pairs the existing metadata object with an ordered scene list. The registry stays metadata-only.
2. Every registered mission is still `planned`. The engine does not invent scenes for a registry row, and it does not treat `planned` as a playback error when a caller supplies a module.
3. The registered mock profile uses checkpoint ids `opening`, `field-work`, `evidence`, and `farewell`. Those ids are sample data. They are not this engine's scene ids. Resuming them against a different module returns `unknown-scene`.
4. `ActivityCompletionEvent.activityId` is not stored by any service. The checkpoint id is the scene id. That is the persisted key.
5. `MilestoneCompletionRequest.checkpointId` is engine context. `rewards.grantMilestone` does not accept it, and the adapter does not send it.
6. `MissionCompletionEvent.completedCheckpointIds` stays in the engine. `progress.completeMission` accepts only `{ missionId }` and uses checkpoints already saved.
7. `DiscoveryUnlockRequest` cannot carry a title or summary. Journal copy stays in the service. The placeholder catalog is not a scene list.
8. `saveCheckpoint` rejects a completed mission. Replay therefore sends no writes.
9. `completeMission` rejects `not_started`. The engine saves a checkpoint before it completes a mission.
10. There is no telemetry event and no new backend method.

No contract change is required for this design. A new scene kind would be an integration-owner change. A new interaction should be a new activity type instead.

## Scene model

Scene kinds are a closed set: `story`, `evidence`, `activity`, `discovery`, `ending`.

Activity types are open. A mission registers a typed component with `defineActivity`. The engine checks that config values are strings, finite numbers, booleans, or null. It does not check that they match the mission's config type. The mission component and the scene author must use the same shape.

A scene id is the checkpoint id. Ids use `isStableKey`: lowercase kebab-case, 1 to 64 characters. Examples: `fixture-opening`, `field-work`. Do not prefix the mission id. The progress row is already for one mission.

`narration` is `academy`, `factual`, or `mixed`.

- Academy narration may omit sources.
- Factual and mixed narration must cite at least one id from `mission.sources`.
- An evidence scene must cite a source and cannot be academy-only.
- Unknown source ids fail validation. The engine does not accept a raw URL in place of a source id.

`citationViewFor` resolves those ids to the mission's `MissionSource` records. A renderer must show `citation.label` as text:

| Narration | Label |
| --- | --- |
| `academy` | Academy narration |
| `factual` | NASA source |
| `mixed` | Academy narration and NASA source |

The label is how a reader tells academy narration from a NASA source. Color is not enough. The engine does not fetch citation URLs.

A scene may also set `framing` to `factual`, `hypothetical`, or `simulation`. The renderer shows that word and a sentence. Academy, hypothetical, and simulation text is not presented as a NASA quotation. A `factual` label still does not call the scene body a quotation.

`media` is optional. `null` shows an empty picture state. A picture loads only when `alt` is present and `src` is a site path or an `http`/`https` address with no username or password. Source links use the same address check. The URL must already be on the mission definition. Unknown source ids and blocked addresses do not become links.

Discovery and ending views call `onDiscoveryRequest` and `onEnding`. Those callbacks carry ids only. The views do not call rewards, XP, or Supabase. Continue remains the control that asks the runtime to save.

### Sequence rules

A module is one ordered list. Phase 4A does not branch.

- The list is not empty.
- Scene ids are unique stable keys.
- The first scene is `story`. Completing that first story scene is the introduction milestone.
- At least one `activity` scene. Completing the first one is the activity milestone. Later activity scenes still report `ActivityCompletionEvent` and do not grant the milestone again.
- At least one `discovery` scene. The first one grants the discovery milestone. Every discovery scene asks the service to unlock its discovery id.
- Exactly one `ending`, and it is last.
- Evidence scenes are optional and may repeat. They do not grant XP.

Bodies are required for story, evidence, and ending. Those strings belong to the mission author. This phase does not ship chapter copy.

## Playback

`reduceNavigation` is a pure state machine. `applyEffects` performs the writes. The React player commits the next position only after every effect succeeds.

| Action | Rule |
| --- | --- |
| `start` | Only from `not_started`. Saves the first scene and does not grant XP. |
| `complete` | Completes the frontier scene, then moves to the next scene. |
| `next` | Moves forward only through scenes that are already complete, and only up to the frontier. |
| `previous` | Moves back one scene. |
| `go-to` | Opens a scene at or before the frontier. |

Completion guards:

- A later scene cannot be completed or opened early.
- Completing a scene that is already complete does nothing.
- An activity scene completes only when `activityComplete` is true. The registered activity calls `onComplete`. A host Continue button must not skip that.
- The ending completes only when every earlier scene is complete.

Replay:

- `in_progress` may revisit completed scenes. Moving the current scene saves that checkpoint and does not grant XP again.
- `completed` may open any scene in the module. The engine sends no `saveCheckpoint`, `grantMilestone`, `unlockDiscovery`, or `completeMission` call.
- A completed visit with no current checkpoint opens on the ending.

Reward order for a newly completed scene:

| Scene | Effects, in order |
| --- | --- |
| First story | `grantMilestone` introduction, then `saveCheckpoint` |
| Later story | `saveCheckpoint` |
| Evidence | `saveCheckpoint` |
| First activity | `grantMilestone` activity, then `saveCheckpoint`. The activity event is local. |
| Later activity | `saveCheckpoint`. The activity event is local. |
| First discovery | `grantMilestone` discovery, `unlockDiscovery`, then `saveCheckpoint` |
| Later discovery | `unlockDiscovery`, then `saveCheckpoint` |
| Ending | `saveCheckpoint`, then `completeMission` |

Rewards are requested before the checkpoint so a failed reward does not mark the scene complete. The ending is the exception: `completeMission` requires an in-progress mission and reads checkpoints that were already saved. The engine does not also call `grantMilestone` for `legacy`. `completeMission` grants that 15 XP with the story achievement.

The checkpoint effect uses:

```ts
{
  missionId,
  checkpointId,          // scene to resume
  completedCheckpointId, // omitted when the learner only moved
}
```

## Service callbacks

`applyEffects` calls only these methods, with only these fields.

| Effect | Call |
| --- | --- |
| `save-checkpoint` | `progress.saveCheckpoint(input)` |
| `grant-milestone` | `rewards.grantMilestone({ missionId, milestoneId })` |
| `unlock-discovery` | `rewards.unlockDiscovery({ missionId, discoveryId })` |
| `complete-mission` | `progress.completeMission({ missionId })` |

The player does not call `auth`, `explorer`, `getMissionProgress`, `getXpSummary`, `unlockAchievement`, or `grantMilestone` with `legacy`.

Failed calls stop the list. Expected failures use `ServiceResult`. The previous scene stays on screen.

## MissionPlayer props

Import the component from `@/engine/MissionPlayer.tsx`. Utilities are exported from `@/engine/index.ts`.

```ts
type MissionPlayerProps = {
  module: MissionModule
  runtime?: MissionRuntimeAdapter
  services?: Pick<NovaServices, 'progress' | 'rewards'>
  progress?: MissionRuntimeState | null
  sceneRenderers?: SceneRendererRegistry
  activities?: ActivityRegistry
  onExit?: () => void
  onRuntimeChange?: (state: MissionRuntimeState) => void
  onActivityComplete?: (event: ActivityCompletionEvent) => void
}
```

`progress` null or omitted means the visit has not started. The player does not load progress itself.

The frame shows the chapter title, the current scene heading, scene progress, Back, Next, Continue, Start or Start again, and Exit when `onExit` is set. Exit does not change the route.

`sceneNavigationState` decides which controls are available:

- Back is disabled on the first scene.
- Next is disabled on the last scene, and whenever the current scene is not complete during an in-progress visit. A completed replay can move through every scene.
- Continue marks the frontier reading scene done. It stays disabled on an activity until that activity calls `onComplete`.
- Start again returns to the first scene. It does not open a locked scene. A completed replay writes nothing.

There is no scene list that a learner can use to jump ahead. `go-to` still rejects an unknown id and a scene beyond the frontier.

The frame uses `Button`, `Card`, `ProgressBar`, `PageHeader`, `LoadingState`, and `ErrorState`. Saving shows "Saving your place". An invalid module or an unknown saved scene shows the issue message and no Next control. Do not show a raw scene id.

`runtime.apply` receives the effect list. `services` is used only when `runtime` is omitted. When both are omitted, `createTrainingRuntime()` keeps the effects in memory. Phase 4B should pass the shared services.

`onRuntimeChange` runs after a successful change. `onActivityComplete` runs only after the activity's writes succeed.

Scene renderers are optional. The default views live in `src/engine/scenes/` and show the scene text, the narration label, and source links that pass the address check. A host that passes `sceneRenderers` still gets a Sources section, and blocked addresses are shown as text. A host renderer should keep the narration label as text. An unknown scene kind shows an error instead of a blank scene.

## Phase 4B seams

Do this on the integration branch, not on the engine branch.

1. Provide one `NovaServices` object through the app provider. Do not import `createMockServices` from `AppProviders` or the production router.
2. On the play route, `lookupMission`, then load that mission's scene module from its own folder. Pass `{ mission, scenes }` into `MissionPlayer`.
3. Call `progress.getMissionProgress` and pass `runtimeStateFromProgress` as `progress`. Pass `null` only for a visit that has no saved row.
4. Pass `runtime` or the same service object as `services`. The player calls `runtime.apply` or the four service methods above. Do not import `createMockServices` from `AppProviders` or the production router.
5. Supply scene renderers and the mission's activity registrations. Keep them out of `src/components/ui/`.
6. On `conflict` or `unavailable`, reload `getMissionProgress` before treating the visit as stuck. A lost response after `completeMission` can make the next `saveCheckpoint` return `conflict`, because a completed mission rejects checkpoint writes.
7. Do not register the structural fixture as a sixth mission.

## Fixture

`createStructuralFixture` looks up `surveyor-3` in the real registry and attaches five structural scenes. The copy is `structuralFixtureNotice`. It is not chapter copy and not a NASA measurement. The evidence scene points at that mission's existing source id so citation checks have a real record to resolve. Do not show the fixture to learners.

## Limits

- Playback is linear.
- Discovery titles and summaries still come from the service. Unknown discovery ids currently become placeholder journal entries in the mock.
- The engine does not reconcile a reward that was saved on the server and then lost on the client after a refresh. The player avoids that during one visit by committing its position only after all effects succeed.
- Phase 4A does not add Supabase, platform pages, production chapter copy, or a new dependency.
