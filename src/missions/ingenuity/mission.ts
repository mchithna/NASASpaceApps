import type { MissionDefinition } from '@/missions/types.ts'

export const mission = {
  id: 'ingenuity',
  displayName: 'Ingenuity',
  chapterTitle: 'Five Flights Became Seventy-Two',
  description:
    "Ingenuity is NASA's helicopter on Mars. It was built to make up to five test flights, and it completed 72. It is still on Mars.",
  destination: 'Mars',
  category: 'mars-helicopter',
  coverImage: '/assets/missions/ingenuity/cover.svg',
  sources: [
    {
      id: 'ingenuity-nasa-science',
      title: 'Ingenuity Mars Helicopter — NASA Science',
      url: 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/',
      credit: 'NASA',
    },
  ],
  achievementId: 'ingenuity-story',
  status: 'planned',
} satisfies MissionDefinition
