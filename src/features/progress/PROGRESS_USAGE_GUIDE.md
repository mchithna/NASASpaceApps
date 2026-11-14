# Progress Service Usage Guide for Mission Engine Integration (Phase 4B)

## Service Initialisation
```ts
import { createProgressService } from '@/features/progress/progressService.ts'

const progress = createProgressService({
  auth: authService,
  rewards: rewardsService,
  client: supabaseClient,
})
```

## Typical Mission Engine Calling Sequence

### 1. Resume / Check Progress on Mission Start
```ts
const overview = await services.progress.getProgressOverview()
const missionProgress = await services.progress.getMissionProgress('surveyor-3')

if (missionProgress.ok) {
  const currentScene = missionProgress.data.currentCheckpointId ?? 'opening'
  // Load mission scene
}
```

### 2. Checkpoint Save and Scene Completion
```ts
// When player advances through scene 'opening' to 'field-work'
const saveResult = await services.progress.saveCheckpoint({
  missionId: 'surveyor-3',
  checkpointId: 'field-work',
  completedCheckpointId: 'opening',
})

if (!saveResult.ok) {
  console.error('Failed to save checkpoint:', saveResult.error.message)
}
```

### 3. Predefined Milestone Grant
```ts
// Activity milestone achieved
const milestoneRes = await services.rewards.grantMilestone({
  missionId: 'surveyor-3',
  milestoneId: 'activity',
})
```

### 4. Mission Completion Boundary
```ts
// Concluding mission
const completionResult = await services.progress.completeMission({
  missionId: 'surveyor-3',
})

if (completionResult.ok) {
  // completionResult.data contains:
  // - progress: updated to status 'completed' with completedAt timestamp
  // - reward: 'legacy' milestone grant (15 XP)
  // - achievement: 'surveyor-3-story' achievement unlock
}
```
Repeated calls to `completeMission` are idempotent; subsequent invocations return `{ awarded: false }` for the reward and achievement without duplicating XP or erroring.
