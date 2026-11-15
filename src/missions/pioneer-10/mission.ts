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
      id: 'pioneer-10-earth-image',
      title: 'Earth photographed by the Apollo 17 crew — December 1972 context',
      url: 'https://images.nasa.gov/details/as17-148-22727',
      credit: 'NASA/Apollo 17 crew',
    },
    {
      id: 'pioneer-10-nasa-science',
      title: 'Pioneer 10 — NASA Science',
      url: 'https://science.nasa.gov/mission/pioneer-10/',
      credit: 'NASA',
    },
    {
      id: 'pioneer-10-last-signal',
      title: 'Pioneer 10 sends its last signal — NASA',
      url: 'https://science.nasa.gov/missions/pioneer/pioneer-10-sends-last-signal/',
      credit: 'NASA',
    },
    {
      id: 'pioneer-10-launch',
      title: 'Pioneer 10 launch, instruments and journey — NASA',
      url: 'https://www.nasa.gov/history/50-years-ago-pioneer-10-launches-to-explore-jupiter/',
      credit: 'NASA; artwork by Rick Guidice and Don Davis as labeled',
    },
    {
      id: 'pioneer-10-history',
      title: 'Pioneer 10 first to explore Jupiter — NASA history',
      url: 'https://www.nasa.gov/history/45-years-ago-pioneer-10-first-to-explore-jupiter/',
      credit: 'NASA',
    },
    {
      id: 'pioneer-10-jupiter',
      title: 'Pioneer 10 at Jupiter — historical observations',
      url: 'https://science.nasa.gov/resource/pioneer-10-at-jupiter/',
      credit: 'NASA',
    },
    {
      id: 'pioneer-10-plaque',
      title: 'Pioneer plaque — NASA Ames',
      url: 'https://science.nasa.gov/resource/pioneer-plaque/',
      credit: 'NASA Ames',
    },
    {
      id: 'pioneer-10-symbols',
      title: 'Greetings from the Pioneers — plaque symbols',
      url: 'https://science.nasa.gov/image-article/apod-1996-june-30-greetings-from-the-pioneers/',
      credit: 'Pioneer Project/ARC/NASA',
    },
    {
      id: 'pioneer-10-belt',
      title: 'Why the asteroid belt is mostly empty space — NASA Dawn FAQ',
      url: 'https://science.nasa.gov/mission/dawn/faq/',
      credit: 'NASA',
    },
    {
      id: 'pioneer-10-dsn',
      title: 'NASA’s Deep Space Network',
      url: 'https://www.nasa.gov/communicating-with-missions/dsn/',
      credit: 'NASA/JPL-Caltech',
    },
    {
      id: 'pioneer-10-dsn-image',
      title: 'Goldstone antennas — PIA23214, 2020 context photograph',
      url: 'https://www.jpl.nasa.gov/images/pia23214-nasas-deep-space-network-goldstone-complex/',
      credit: 'NASA/JPL-Caltech',
    },
  ],
  achievementId: 'pioneer-10-story',
  status: 'available',
} satisfies MissionDefinition
