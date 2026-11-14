# Phase 4A handover

This is the engine-facing contract for the Phase 4B merge. It describes the code in `src/engine/` as of this branch. It does not claim production persistence, finished chapter copy, or a live play route.

The public import path is `@/engine/index.ts`. Chapter code should prefer that barrel. Dev-only pieces are included there so the integration owner can find them. They are not mounted by the app.

## Audit

Checked against the shared Phase 1.5 contracts and the files this branch is allowed to own.

| Check | Result |
| --- | --- |
| Shared contracts | Calls use `saveCheckpoint`, `grantMilestone({ missionId, milestoneId })`, `unlockDiscovery({ missionId, discoveryId })`, and `completeMission({ missionId })`. No method sends an XP amount. `checkpointId` on an internal grant effect is dropped before the service call. |
| Ownership | Engine code lives under `src/engine/`. It reads `lookupMission` and shared UI components. It does not edit the router, providers, registry, contracts, global UI, package manifest, or the five mission packages. |
| Accessibility | Controls are buttons or radios with visible names. Timeline order uses Up and Down. Match and prediction activities are selectable. Narration is text, not color alone. Saving uses `role="status"`. Failures use `role="alert"`. Footer controls use `w-full sm:w-auto`. A phone browser was not opened because the preview is not routed. |
| Duplicate rewards | Introduction, activity, and discovery grants are emitted only for the first scene of that kind. Legacy XP is emitted only by `completeMission`. Replay navigation emits no effects. `createServiceRuntime` skips a write it has already confirmed. The mock also refuses a second XP grant for the same mission and milestone. |
| Sources and media | A link is rendered only for an `http` or `https` URL from the mission definition, with no username or password. Academy, hypothetical, and simulation text is labeled and is not called a NASA quotation. `media: null` shows an empty picture state. An unknown source id fails validation before play. |
| Crash paths | An invalid module, unknown checkpoint, unknown activity type, or unregistered custom activity shows an error and no Next control. A failed or signed-out save stays on the current scene and shows the service message. An unknown scene kind shows "This scene cannot be shown." |

## Public player props

`MissionPlayer` is the only component Phase 4B needs to mount.

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
  onDiscoveryRequest?: (request: DiscoveryUnlockRequest) => void
  onEnding?: (action: EndingSceneAction) => void
}
```

- `module.mission` must be one of the five `MissionDefinition` objects from the registry. `module.scenes` is engine-owned and is not stored on the registry.
- Pass `runtime` from `createServiceRuntime(services)` when Phase 2 services exist. If `runtime` is omitted and `services` is passed, the player creates one service runtime for that mount. If both are omitted, effects stay in `createTrainingRuntime()` and are not written to the mock.
- `progress` comes from `runtime.loadProgress(missionId)` or from `runtimeStateFromProgress(await progress.getMissionProgress(missionId))`. `null` means the visit has not started. The player does not fetch progress itself.
- `onExit` does not change the route. The page decides where Exit goes.
- `onDiscoveryRequest` and `onEnding` are notifications. They do not grant XP. Continue is what asks the runtime to save.
- `onActivityComplete` runs only after the activity's writes succeed. It carries `missionId`, `checkpointId`, and `activityId`. It does not carry XP.
- `onRuntimeChange` runs after a successful local position change.

Phases shown by the player are `invalid`, `ready`, `saving`, and `error`. "Your place is saved." appears only after the adapter resolves successfully.

## Extension registration

Scene kinds are closed: `story`, `evidence`, `activity`, `discovery`, `ending`.

Activity types are open. A chapter package registers one with `defineActivity` and passes the registry on the `activities` prop. Do not edit `MissionPlayer` to add a chapter activity.

```ts
const slot = defineActivity<{ label: string }>('chapter-slot', (props) => (
  <button type="button" onClick={props.onComplete}>
    {props.label}
  </button>
))

const registered = createActivityRegistry([
  ...builtinActivityRegistrations,
  slot,
])
```

The sample that does this today is `training-slot` in `src/engine/training/trainingSlotActivity.tsx`. Spread `builtinActivityRegistrations` when the chapter also uses `event-order`, `evidence-match`, or `prediction-choice`. A module that names an unregistered type does not open.

Reusable prompts live on the activity scene as `prompt`, not inside the flat `config` object. `config` values stay strings, finite numbers, booleans, or null.

## Scene schema

Every scene has `id`, `title`, `narration`, and `sourceIds`. `id` is the checkpoint id. Ids are lowercase kebab-case, 1 to 64 characters, from `isStableKey`.

| Kind | Required fields | Notes |
| --- | --- | --- |
| `story` | `body` | The first scene must be a story. Completing it grants `introduction`. |
| `evidence` | `body`, at least one known source id | Cannot be academy-only. Does not grant XP. |
| `activity` | `activityId`, `activityType`, `config` | The first completion grants `activity`. Later activities still emit `ActivityCompletionEvent` and do not grant that milestone again. |
| `discovery` | `discoveryId` | The first completion grants `discovery` and every discovery calls `unlockDiscovery`. Optional `body`. |
| `ending` | `body` | Exactly one, and it must be last. Completion calls `saveCheckpoint`, then `completeMission({ missionId })`. The engine does not also call `grantMilestone` for `legacy`. |

`narration` is `academy`, `factual`, or `mixed`. Factual and mixed scenes must cite ids from `mission.sources`. Optional `framing` is `factual`, `hypothetical`, or `simulation`. Optional `media` is `{ src, alt, credit? }` or `null`. Optional `instruction` is a short direction.

A sequence is rejected when it is empty, repeats an id, starts with a non-story, lacks an activity or discovery, or does not end with the only ending.

## Callback and effect contracts

`reduceNavigation` returns effects. `createServiceRuntime.apply` performs them in order and stops on the first failure. Confirmed writes are not sent again by that runtime instance. A failed write stays retryable.

| Scene completion | Service calls, in order |
| --- | --- |
| First story | `grantMilestone` `introduction`, then `saveCheckpoint` |
| Later story or evidence | `saveCheckpoint` |
| First activity | `grantMilestone` `activity`, then `saveCheckpoint` |
| Later activity | `saveCheckpoint` |
| First discovery | `grantMilestone` `discovery`, `unlockDiscovery`, then `saveCheckpoint` |
| Later discovery | `unlockDiscovery`, then `saveCheckpoint` |
| Ending | `saveCheckpoint`, then `completeMission({ missionId })` |

`saveCheckpoint` receives `missionId`, `checkpointId`, and `completedCheckpointId` only when a scene was finished. Start saves the first checkpoint and does not grant XP.

`MissionRuntimeAdapter` is `{ apply(effects) }`. `ServiceRuntime` adds `loadProgress(missionId)`.

## Mock wiring

`createMockServices` is for tests and the dev preview. The engine does not import it from `AppProviders` or the router.

```ts
const services = createMockServices({ persona: 'guest' })
const runtime = createServiceRuntime(services)
const loaded = await runtime.loadProgress(mission.id)

<MissionPlayer
  module={{ mission, scenes }}
  runtime={runtime}
  activities={registry}
  progress={loaded.ok ? loaded.data : null}
/>
```

`TrainingSimulatorPreview` does this for the practice visit. The mock stores progress on that object only. A new `createMockServices()` call is empty. A browser reload is not persistent.

Guest and registered personas can write. The default persona is `signed-out`. A signed-out write returns `unauthenticated` and the player stays on the current scene.

The practice visit uses the real `surveyor-3` metadata object and the scene ids `sim-intro`, `sim-evidence`, `sim-timeline`, `sim-slot`, `sim-discovery`, and `sim-ending`. Those ids are not the mock sample ids `opening`, `field-work`, `evidence`, and `farewell`.

## Production wiring requests

Do this on the integration branch. Do not do it inside the engine branch.

### Phase 2 services

`AppProviders` currently returns `children` and does not hold `NovaServices`.

1. Build one `NovaServices` object for the signed-in explorer. The real implementation must already match `src/contracts/services.ts`.
2. Provide that object to the tree. Do not import `createMockServices` from `AppProviders` or the production router.
3. Pass `progress` and `rewards` into `createServiceRuntime`. Keep using the four methods above. Do not add an XP argument.
4. `completeMission` must commit completion, the legacy 15 XP, and the story achievement together. `grantMilestone` must ignore a repeated mission and milestone. The engine will not send legacy through `grantMilestone`.

### Phase 3 pages and route

`MissionOverviewPage` already links to `/missions/:missionId/play`. `MissionPlayerPage` still renders `MissionFacts` and a back link. The route already exists in `src/app/router.tsx`. No new path is required.

On `MissionPlayerPage` only:

1. Keep `useMissionParam()`. If the lookup is `not-found`, keep rendering `NotFoundPage`.
2. Load that mission's scene module from `src/missions/<mission-id>/`. Until a chapter exports scenes, do not invent them. The training simulator must not be shown to learners.
3. Call `runtime.loadProgress(mission.id)`. Pass the result as `progress`. Pass `null` only when the service reports that the visit has not started.
4. Render `MissionPlayer` with `{ mission, scenes }`, the runtime, and that chapter's activity registry.
5. Point `onExit` at `/missions/${mission.id}`. The player will not navigate.
6. On `conflict` or `unavailable`, call `getMissionProgress` again before treating the visit as stuck. A lost `completeMission` response can make the next `saveCheckpoint` return `conflict`.

Optional, development only: add a route that renders `TrainingSimulatorPreview`. Do not include it in the production build as a learner destination, and do not add `training-simulator` to `missionIds`.

## Sample walkthrough

`TrainingSimulatorPreview`, or `MissionPlayer` plus `createTrainingSimulator()` and `createTrainingActivities()`:

1. Start. The mock saves `sim-intro`. No XP yet.
2. Continue the intro. Introduction grants 20 XP. The evidence scene shows the existing Surveyor 3 source link and an empty picture.
3. Continue the evidence. No XP.
4. Order the two practice steps from the keyboard and check. The activity milestone grants 40 XP.
5. Mark the custom slot done. No second activity grant.
6. Continue the discovery. Discovery grants 25 XP and unlocks `sim-note` as a placeholder journal entry.
7. Continue the ending. `completeMission` grants legacy 15 XP and the story achievement.
8. The XP total is `missionXpCap` (100). Back and Next on the finished visit do not change that total.

## Tests and commands

| Command | What it covers |
| --- | --- |
| `npm run test` | Unit, component, training simulator, and `src/engine/phase4a.integration.test.tsx` |
| `npm run typecheck` | Project TypeScript build |
| `npm run lint` | ESLint |
| `npm run build` | `tsc -b` and the Vite production build |

`npm run format` was not run. It would rewrite files outside the engine. `npm run dev` and `npm run preview` were not run. They start servers, and the play route does not mount `MissionPlayer`.

The integration test uses one guest `createMockServices()` instance. It resumes after the intro, shows the Surveyor 3 source link, finishes all four milestones at 100 XP, and replays without a fifth reward event.

## Known limits

- Playback is linear. There is no scene menu.
- Chapter packages do not export scenes yet. The training copy is not a NASA chapter.
- Discovery titles for unknown ids come from the mock placeholder, not from the engine.
- The service runtime's duplicate suppression lasts for that object. A new runtime still relies on the service to refuse a second XP grant.
- The adapter is not one database transaction across a grant and a checkpoint. `completeMission` is the transactional boundary.
- Media addresses and source URLs are checked in the browser. They are not fetched.
- Reduced motion is handled by the shared components' `motion-safe` classes. This branch did not run a phone or desktop browser pass on an unrouted preview.

## Phase 4B action list

1. Provide one real `NovaServices` object. Do not register the mock in the production provider or router.
2. Mount `MissionPlayer` on the existing play route with registry metadata, chapter scenes, `createServiceRuntime`, and `loadProgress`.
3. Pass each chapter's `defineActivity` registry. Keep chapter activities out of `MissionPlayer`.
4. Send Exit back to the overview page.
5. Reload progress after `conflict` or `unavailable`.
6. Do not add a sixth mission id. Do not show the training simulator to learners.
7. Keep `completeMission` as the only legacy grant. Do not add a client XP field.

## Pull request summary

Phase 4A adds a mission player, scene views, reusable and custom activities, and a service runtime that calls the existing progress and reward methods. A labeled training simulator proves one visit from intro through legacy on a guest mock. The five production missions, the router, and the shared contracts are unchanged.

## Risks

- Mounting the player without chapter scenes would show an empty or invalid module. Wait for a chapter export or keep the current placeholder page.
- Wiring a signed-out service makes Start fail with the unauthenticated message. The page should start a guest or registered session first.
- Replacing the service object on each render creates a new runtime and drops the in-memory confirmation ledger. Create the runtime once per visit.
- A lost `completeMission` response can make the next checkpoint save return `conflict`. Reload progress before retrying.
- The training simulator reuses Surveyor 3's real metadata and source URL. Its sentences are practice copy. Do not present that visit as the Surveyor 3 chapter.
- Phone layout was checked by the responsive control classes and keyboard tests, not by a device viewport.
