import type { MissionDefinition } from '@/missions/types.ts'

export const mission = {
  id: 'insight',
  displayName: 'InSight',
  chapterTitle: 'The Machine That Listened to Mars',
  description:
    'A lander that never drove listened to Mars for more than four years. Follow the vibrations that revealed the planet beneath the surface.',
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
    {
      id: 'insight-instruments',
      title: 'InSight science instruments — NASA',
      url: 'https://science.nasa.gov/mission/insight/science-instruments/',
      credit: 'NASA',
    },
    {
      id: 'insight-first-quake',
      title: 'First likely marsquake heard by InSight — NASA',
      url: 'https://science.nasa.gov/resource/first-likely-marsquake-heard-by-nasas-insight/',
      credit: 'NASA/JPL-Caltech/CNES/IPGP/Imperial College London',
    },
    {
      id: 'insight-interior',
      title: 'How InSight studies Mars inner layers — NASA',
      url: 'https://science.nasa.gov/resource/how-insight-studies-mars-inner-layers/',
      credit: 'NASA/JPL-Caltech',
    },
    {
      id: 'insight-power',
      title: 'InSight power generation after landing and spring 2022 — NASA',
      url: 'https://science.nasa.gov/resource/insights-power-generation-after-landing-and-spring-2022/',
      credit: 'NASA/JPL-Caltech',
    },
    {
      id: 'insight-retirement',
      title: 'NASA retires the InSight Mars lander mission',
      url: 'https://www.nasa.gov/missions/insight/nasa-retires-insight-mars-lander-mission-after-years-of-science/',
      credit: 'NASA',
    },
    {
      id: 'insight-last-image',
      title: 'One of InSight’s last images — NASA',
      url: 'https://science.nasa.gov/resource/one-of-insights-last-images/',
      credit: 'NASA/JPL-Caltech',
    },
    {
      id: 'insight-first-selfie',
      title: 'InSight’s first selfie — NASA',
      url: 'https://science.nasa.gov/resource/insights-first-selfie/',
      credit: 'NASA/JPL-Caltech',
    },
    {
      id: 'insight-seis-deployed',
      title: 'SEIS deployed on Mars — NASA',
      url: 'https://science.nasa.gov/resource/seis-deployed-on-mars/',
      credit: 'NASA/JPL-Caltech',
    },
    {
      id: 'insight-final-selfie',
      title: 'InSight’s final selfie — NASA',
      url: 'https://science.nasa.gov/resource/insights-final-selfie/',
      credit: 'NASA/JPL-Caltech',
    },
  ],
  achievementId: 'insight-story',
  status: 'available',
} satisfies MissionDefinition
