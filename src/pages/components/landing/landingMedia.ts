import type { MissionId } from '@/missions/types.ts'

export const landingMedia: Record<
  MissionId,
  { alt: string; credit: string; source: string; kind: string }
> = {
  'surveyor-3': {
    alt: 'Surveyor 3 lander on the Moon, photographed by the Apollo 12 crew',
    credit: 'NASA/JSC',
    kind: 'Apollo 12 photograph',
    source:
      'https://science.nasa.gov/resource/view-of-surveyor-iii-in-its-crater/',
  },
  opportunity: {
    alt: 'Artist concept of a Mars Exploration Rover, the design used for Opportunity, on Mars',
    credit: 'NASA/JPL/Cornell University/Maas Digital',
    kind: 'Artist concept',
    source:
      'https://science.nasa.gov/photojournal/mars-exploration-rover-vertical-artists-concept/',
  },
  ingenuity: {
    alt: 'Artist concept of the Ingenuity helicopter flying above Mars',
    credit: 'NASA/JPL-Caltech',
    kind: 'Artist concept',
    source:
      'https://science.nasa.gov/photojournal/ingenuity-mars-helicopter-in-flight-artists-concept/',
  },
  insight: {
    alt: 'Artist concept of the InSight lander with its two circular solar panels on Mars',
    credit: 'NASA/JPL-Caltech',
    kind: 'Artist concept',
    source: 'https://science.nasa.gov/mission/insight/',
  },
  'pioneer-10': {
    alt: 'Artist concept of Pioneer 10 with its dish antenna near Jupiter',
    credit: 'NASA',
    kind: 'Artist concept',
    source: 'https://science.nasa.gov/mission/pioneer-10/',
  },
}
