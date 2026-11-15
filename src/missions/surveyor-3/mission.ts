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
    {
      id: 'surveyor-3-jpl',
      title: 'Surveyor 3 — NASA JPL',
      url: 'https://www.jpl.nasa.gov/missions/surveyor-3/',
      credit: 'NASA/JPL',
    },
    {
      id: 'surveyor-3-footpads',
      title: 'Footpads and Footprints — NASA',
      url: 'https://science.nasa.gov/solar-system/moon/footpads-and-footprints-humans-and-machine-meet-on-the-moon/',
      credit: 'NASA',
    },
    {
      id: 'surveyor-3-apollo-history',
      title: 'Apollo 12 Makes a Pinpoint Landing — NASA',
      url: 'https://www.nasa.gov/history/55-years-ago-apollo-12-makes-a-pinpoint-landing-on-the-moon/',
      credit: 'NASA',
    },
    {
      id: 'surveyor-3-systems',
      title: 'NASA Historical Data Book, Volume II — Surveyor spacecraft',
      url: 'https://www.nasa.gov/wp-content/uploads/2023/04/sp-4012v2.pdf',
      credit: 'NASA',
    },
  ],
  achievementId: 'surveyor-3-story',
  status: 'available',
} satisfies MissionDefinition
