import type { MissionDefinition } from '@/missions/types.ts'

export const mission = {
  id: 'insight',
  displayName: 'InSight',
  chapterTitle: 'The Machine That Listened to Mars',
  description:
    'InSight is a NASA lander on Mars. It set a seismometer on the surface to study the inside of the planet. The lander is still there.',
  destination: 'Mars',
  category: 'mars-lander',
  coverImage: '/assets/missions/insight/cover.svg',
  sources: [
    {
      id: 'insight-nasa-science',
      title: 'InSight — NASA Science',
      url: 'https://science.nasa.gov/mission/insight/',
      credit: 'NASA',
    },
  ],
  achievementId: 'insight-story',
  status: 'planned',
} satisfies MissionDefinition
