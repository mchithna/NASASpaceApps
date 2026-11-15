import type { MissionId } from '@/missions/types.ts'

export type LearningCard = {
  title: string
  explanation: string
  simple: string
  source: { title: string; url: string }
}

// Reviewed summaries, not generated answers. Sources checked 2026-11-15.
export const briefings: Record<MissionId, LearningCard> = {
  'surveyor-3': {
    title: 'Surveyor 3',
    explanation:
      'Surveyor 3 was a robotic Moon lander that tested the lunar surface. Apollo 12 astronauts later visited it and returned selected parts so scientists could study exposure to the Moon’s environment.',
    simple:
      'Surveyor 3 was a robot that landed on the Moon. Astronauts later brought some of its parts home to study them.',
    source: {
      title: 'NASA: Surveyor 3',
      url: 'https://science.nasa.gov/mission/surveyor-3/',
    },
  },
  opportunity: {
    title: 'Opportunity',
    explanation:
      'Opportunity explored rocks on Mars. Together with Spirit, it helped establish that liquid water persisted on the Martian surface in the ancient past. Its solar-powered mission lost contact during a planet-wide dust storm.',
    simple:
      'Opportunity was a robot that drove on Mars. It studied rocks for clues that Mars once had water on its surface.',
    source: {
      title: 'NASA: Spirit and Opportunity',
      url: 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/',
    },
  },
  ingenuity: {
    title: 'Ingenuity',
    explanation:
      'Ingenuity demonstrated powered, controlled flight on Mars. It traveled there with Perseverance and later served as an aerial scout for scientists and rover planners.',
    simple:
      'Ingenuity was a small helicopter on Mars. It showed that a robot could fly there and helped the rover team look ahead.',
    source: {
      title: 'NASA: Ingenuity',
      url: 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/',
    },
  },
  insight: {
    title: 'InSight',
    explanation:
      'InSight was a lander designed to study the internal structure of Mars. Its seismometer measured ground vibrations, helping scientists investigate the planet beneath its surface.',
    simple:
      'InSight stayed in one place on Mars. It measured tiny shakes in the ground to help scientists learn about the inside of the planet.',
    source: {
      title: 'NASA: InSight instruments',
      url: 'https://science.nasa.gov/mission/insight/science-instruments/',
    },
  },
  'pioneer-10': {
    title: 'Pioneer 10',
    explanation:
      'Pioneer 10 was the first spacecraft to fly through the main asteroid belt and past Jupiter. It sent scientific observations back to Earth as it traveled into the outer solar system.',
    simple:
      'Pioneer 10 was a space robot that flew past Jupiter. It sent information home to help scientists study places far from Earth.',
    source: {
      title: 'NASA: Pioneer 10',
      url: 'https://science.nasa.gov/mission/pioneer-10/',
    },
  },
}

export const glossary: readonly LearningCard[] = [
  {
    title: 'Telemetry',
    explanation:
      'Telemetry is science and engineering information sent from a spacecraft to Earth using radio signals.',
    simple:
      'Telemetry is a spacecraft sending its measurements and updates home by radio.',
    source: {
      title: 'NASA: What does the Deep Space Network do?',
      url: 'https://www.nasa.gov/directorates/somd/space-communications-navigation-program/dsn-functions/',
    },
  },
  {
    title: 'Atmosphere',
    explanation:
      'An atmosphere is the layer of gases surrounding a planet. Earth’s atmosphere includes the air we breathe.',
    simple: 'An atmosphere is a planet’s jacket of gases.',
    source: {
      title: 'NASA Space Place: Earth’s atmosphere',
      url: 'https://spaceplace.nasa.gov/atmosphere/en/',
    },
  },
  {
    title: 'Seismometer',
    explanation:
      'A seismometer measures ground vibrations. InSight used one on Mars to investigate the planet’s interior.',
    simple: 'A seismometer is a tool that measures tiny shakes in the ground.',
    source: {
      title: 'NASA: InSight instruments',
      url: 'https://science.nasa.gov/mission/insight/science-instruments/',
    },
  },
]

export type LocalAnswer = { text: string; source?: LearningCard['source'] }

export function answerLocally(question: string, simple: boolean): LocalAnswer {
  const query = question.toLowerCase().trim()
  const cards = [...Object.values(briefings), ...glossary]
  const matching = cards.filter((card) =>
    query.includes(card.title.toLowerCase()),
  )
  // Avoid implying that a fixed summary answers arbitrary questions or comparisons.
  if (matching.length === 1) {
    const card = matching[0]
    return {
      text: `From the source guide: ${simple ? card.simple : card.explanation}`,
      source: card.source,
    }
  }
  if (
    /^(help|app help|how (do i|to) (use|play)|what can you do)[?.!]*$/.test(
      query,
    )
  ) {
    return {
      text: 'Open Mission Control to choose a mission. Available chapters have a start or resume action. Completed mission milestones earn XP; your Journal and Achievements show unlocked discoveries and honors. This companion cannot award progress.',
    }
  }
  return {
    text: 'I don’t have a reviewed answer for that question. This local guide can show a short overview of Surveyor 3, Opportunity, Ingenuity, InSight, or Pioneer 10, and explain telemetry, atmosphere, or seismometer. Try a topic button or read the linked NASA source. Live AI answers are not connected yet.',
  }
}
