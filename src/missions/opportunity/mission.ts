import type { MissionDefinition } from '@/missions/types.ts'

export const mission = {
  id: 'opportunity',
  displayName: 'Opportunity',
  chapterTitle: "The Explorer That Wouldn't Stop",
  description:
    'Opportunity is a NASA rover that explored Mars. It stayed on Mars after its mission ended.',
  destination: 'Mars',
  category: 'mars-rover',
  coverImage: '/assets/missions/opportunity/cover.svg',
  sources: [
    {
      id: 'opportunity-nasa-science',
      title: 'Opportunity — NASA Science',
      url: 'https://science.nasa.gov/mission/mer-opportunity/',
      credit: 'NASA',
    },
  ],
  achievementId: 'opportunity-story',
  status: 'planned',
} satisfies MissionDefinition
