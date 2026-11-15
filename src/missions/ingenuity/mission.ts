import type { MissionDefinition } from '@/missions/types.ts'

export const mission = {
  id: 'ingenuity',
  displayName: 'Ingenuity',
  chapterTitle: 'Five Flights Became Seventy-Two',
  description:
    "Ingenuity is NASA's helicopter on Mars. It was built to make up to five test flights, and it completed 72. It is still on Mars.",
  destination: 'Mars',
  category: 'mars-helicopter',
  coverImage: '/assets/missions/ingenuity/ingenuity-mars.webp',
  sources: [
    {
      id: 'ingenuity-atmosphere',
      title:
        'Six things to know about Ingenuity — thin atmosphere and engineering',
      url: 'https://www.nasa.gov/solar-system/6-things-to-know-about-nasas-mars-helicopter-on-its-way-to-mars/',
      credit: 'NASA/JPL-Caltech',
    },
    {
      id: 'ingenuity-nasa-science',
      title: 'Ingenuity Mars Helicopter — NASA Science',
      url: 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/',
      credit: 'NASA',
    },
    {
      id: 'ingenuity-hardware',
      title: 'Ingenuity spacecraft anatomy — NASA/JPL landing press kit',
      url: 'https://www.jpl.nasa.gov/news/press_kits/ingenuity/landing/mission/spacecraft/',
      credit: 'NASA/JPL-Caltech',
    },
    {
      id: 'ingenuity-first-flight',
      title: 'NASA’s Ingenuity succeeds in historic first flight',
      url: 'https://www.nasa.gov/news-release/nasas-ingenuity-mars-helicopter-succeeds-in-historic-first-flight/',
      credit: 'NASA',
    },
    {
      id: 'ingenuity-first-video',
      title: 'First video of Ingenuity in flight',
      url: 'https://science.nasa.gov/resource/first-video-of-nasas-ingenuity-mars-helicopter-in-flight/',
      credit: 'NASA/JPL-Caltech/ASU/MSSS',
    },
    {
      id: 'ingenuity-mission-end',
      title: 'After three years on Mars, Ingenuity’s flying mission ends',
      url: 'https://www.jpl.nasa.gov/news/after-three-years-on-mars-nasas-ingenuity-helicopter-mission-ends/',
      credit: 'NASA/JPL-Caltech',
    },
    {
      id: 'ingenuity-investigation',
      title: 'NASA investigates Flight 72 — December 2024',
      url: 'https://www.nasa.gov/missions/mars-2020-perseverance/ingenuity-helicopter/nasa-performs-first-aircraft-accident-investigation-on-another-world/',
      credit: 'NASA/JPL-Caltech',
    },
    {
      id: 'ingenuity-damage-image',
      title: 'Shadow of Ingenuity’s damaged rotor blade — PIA26243',
      url: 'https://www.jpl.nasa.gov/images/pia26243-ingenuity-spots-the-shadow-of-its-damaged-rotor-blade/',
      credit: 'NASA/JPL-Caltech',
    },
    {
      id: 'ingenuity-sand-image',
      title: 'Sand ripples during Flight 70 — PIA26242',
      url: 'https://www.jpl.nasa.gov/images/pia26242-ingenuitys-view-of-sand-ripples-during-flight-70/',
      credit: 'NASA/JPL-Caltech',
    },
    {
      id: 'ingenuity-hard-landing',
      title: 'Ingenuity’s hard landing: most likely scenario — PIA26482',
      url: 'https://www.jpl.nasa.gov/images/pia26482-ingenuitys-hard-landing/',
      credit: 'NASA/JPL-Caltech',
    },
    {
      id: 'ingenuity-surface-image',
      title: 'Perseverance checks out Ingenuity — PIA25968',
      url: 'https://www.jpl.nasa.gov/images/pia25968-perseverance-checks-out-ingenuity/',
      credit: 'NASA/JPL-Caltech/ASU/MSSS',
    },
  ],
  achievementId: 'ingenuity-story',
  status: 'available',
} satisfies MissionDefinition
