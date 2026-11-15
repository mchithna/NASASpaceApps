import type { MissionDefinition } from '@/missions/types.ts'

export const mission = {
  id: 'opportunity',
  displayName: 'Opportunity',
  chapterTitle: "The Explorer That Wouldn't Stop",
  description:
    'Follow a 90-sol mission into almost 15 years of exploration. Investigate ancient water, cross crater landscapes and discover why the sky went dark.',
  destination: 'Mars',
  category: 'mars-rover',
  coverImage: '/assets/missions/opportunity/victoria-crater.jpg',
  sources: [
    {
      id: 'opportunity-nasa-science',
      title: 'Opportunity — NASA Science',
      url: 'https://science.nasa.gov/mission/mer-opportunity/',
      credit: 'NASA',
    },
    {
      id: 'opportunity-instruments',
      title: 'Rover science instruments — NASA',
      url: 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/science-instruments/',
      credit: 'NASA',
    },
    {
      id: 'opportunity-science-highlights',
      title: 'Water evidence and science highlights — NASA',
      url: 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/science-highlights/',
      credit: 'NASA',
    },
    {
      id: 'opportunity-six-things',
      title: 'Six Things to Know About Opportunity — NASA',
      url: 'https://science.nasa.gov/missions/mer/six-things-to-know-about-nasas-opportunity-rover/',
      credit: 'NASA',
    },
    {
      id: 'opportunity-mission-end',
      title: 'Opportunity mission comes to an end — NASA',
      url: 'https://science.nasa.gov/missions/mer/nasas-opportunity-rover-mission-on-mars-comes-to-end/',
      credit: 'NASA/JPL-Caltech',
    },
    {
      id: 'opportunity-final-panorama',
      title: 'Opportunity’s final panorama — NASA/JPL',
      url: 'https://www.jpl.nasa.gov/news/opportunitys-parting-shot-was-a-beautiful-panorama/',
      credit: 'NASA/JPL-Caltech/Cornell/ASU',
    },
    {
      id: 'opportunity-traverse',
      title: 'Opportunity’s final traverse map — NASA',
      url: 'https://science.nasa.gov/photojournal/opportunitys-final-traverse-map/',
      credit: 'NASA/JPL-Caltech/MSSS',
    },
  ],
  achievementId: 'opportunity-story',
  status: 'available',
} satisfies MissionDefinition
