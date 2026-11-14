import type { MissionDefinition } from '@/missions/types.ts'

export const mission = {
  id: 'surveyor-3',
  displayName: 'Surveyor 3',
  chapterTitle: 'The Robot They Came Back For',
  description:
    'Surveyor 3 is a NASA robotic lander on the Moon. Apollo 12 astronauts visited it and brought some of its parts back to Earth. The lander itself is still there.',
  destination: 'Moon',
  category: 'lunar-lander',
  coverImage: '/assets/missions/surveyor-3/cover.svg',
  sources: [
    {
      id: 'surveyor-3-nasa-science',
      title: 'Surveyor 3 — NASA Science',
      url: 'https://science.nasa.gov/mission/surveyor-3/',
      credit: 'NASA',
    },
  ],
  achievementId: 'surveyor-3-story',
  status: 'planned',
} satisfies MissionDefinition
