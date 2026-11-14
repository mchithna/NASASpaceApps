import type { MissionDefinition } from '@/missions/types.ts'

export const mission = {
  id: 'pioneer-10',
  displayName: 'Pioneer 10',
  chapterTitle: 'The Messenger That Never Came Home',
  description:
    'Pioneer 10 is a NASA probe that flew past Jupiter and kept traveling outward. Earth received its last signal in January 2003.',
  destination: 'Deep space',
  category: 'deep-space-probe',
  coverImage: '/assets/missions/pioneer-10/cover.svg',
  sources: [
    {
      id: 'pioneer-10-nasa-science',
      title: 'Pioneer 10 — NASA Science',
      url: 'https://science.nasa.gov/mission/pioneer-10/',
      credit: 'NASA',
    },
  ],
  achievementId: 'pioneer-10-story',
  status: 'planned',
} satisfies MissionDefinition
