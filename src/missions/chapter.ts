import type { ActivityRegistry } from '@/engine/activityRegistry.ts'
import type { MissionModule } from '@/engine/scenes.ts'
import { lookupMission } from '@/missions/registry.ts'
import type { MissionId } from '@/missions/types.ts'

/** Export `chapter` beside `mission` from a package's index.ts. */
export type MissionChapter = {
  scenes: MissionModule['scenes']
  activities: ActivityRegistry
}

type ChapterPackage = { chapter?: MissionChapter }
const packages = import.meta.glob<ChapterPackage>('./*/index.ts')

/** The canonical registry decides membership; the glob only loads package content. */
export async function loadMissionChapter(id: MissionId): Promise<{
  module: MissionModule
  activities: ActivityRegistry
} | null> {
  const found = lookupMission(id)
  if (found.status !== 'found') return null
  const load = packages[`./${id}/index.ts`]
  const chapter = load ? (await load()).chapter : undefined
  return chapter
    ? {
        module: { mission: found.mission, scenes: chapter.scenes },
        activities: chapter.activities,
      }
    : null
}
