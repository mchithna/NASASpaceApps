# Rewards and Journal Service Integration Guide (Phase 4B)

## Service Initialisation
```ts
import { createRewardsService } from '@/features/achievements/rewardsService.ts'

const rewards = createRewardsService({
  auth: authService,
  client: supabaseClient,
})
```

## Milestone Rewards and XP Ladder
Milestone grants are strictly catalog-defined:
- `introduction`: 20 XP
- `activity`: 40 XP
- `discovery`: 25 XP
- `legacy`: 15 XP

Maximum per mission: 100 XP. Maximum across 5 missions: 500 XP.

### Rank Boundaries:
- `0 - 99 XP`: Space Cadet (Level 1)
- `100 - 199 XP`: Lunar Explorer (Level 2)
- `200 - 299 XP`: Planetary Explorer (Level 3)
- `300 - 399 XP`: Mission Specialist (Level 4)
- `400 - 499 XP`: Deep Space Explorer (Level 5)
- `500+ XP`: Legacy Guardian (Level 6)

### Calling Milestone Grants:
```ts
const grant = await services.rewards.grantMilestone({
  missionId: 'ingenuity',
  milestoneId: 'activity',
})

if (grant.ok) {
  console.log(`Earned ${grant.data.xpAwarded} XP! New total: ${grant.data.totalXp}`)
  console.log(`Current Rank: ${grant.data.rank.name}`)
}
```

### Discovery Unlocks:
```ts
const discovery = await services.rewards.unlockDiscovery({
  missionId: 'ingenuity',
  discoveryId: 'ingenuity-notes',
})
```

### Story Achievements:
```ts
const achievement = await services.rewards.unlockAchievement('ingenuity-story')
```
All milestone grants, achievements, and journal unlocks are strictly idempotent. Repeated calls return `{ awarded: false }` and do not inflate XP or create duplicate database records.
