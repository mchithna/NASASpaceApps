import type { SceneMedia } from '@/engine/scenes.ts'
import type {
  EventOrderPrompt,
  EvidenceMatchPrompt,
  PredictionPrompt,
} from '@/engine/activities/prompts.ts'

export const root = '/assets/missions/pioneer-10/'
export const deepSpace: SceneMedia = {
  src: `${root}deep-space-art.webp`,
  alt: 'Historical artwork shows Pioneer 10 beyond the planets against deep space.',
  credit:
    'NASA/Don Davis · Pioneer 10 Leaving the Planets Behind. Artwork, not a photograph.',
}
export const plaqueImage: SceneMedia = {
  src: `${root}pioneer-plaque.webp`,
  alt: 'Authentic Pioneer plaque diagram: hydrogen states at upper left, pulsar map at left, human figures and spacecraft at right, solar system along the bottom.',
  credit:
    'NASA Ames · Historical Pioneer plaque diagram, carried physically on Pioneers 10 and 11.',
}
export const instruments: SceneMedia = {
  src: `${root}spacecraft-diagram.webp`,
  alt: 'NASA’s labeled Pioneer 10 scientific instrument diagram, including magnetometer boom and instruments behind the antenna.',
  credit:
    'NASA · Instrument-location reference, published in the Pioneer 10 launch history.',
}
export const observations: SceneMedia = {
  src: `${root}jupiter-observations.webp`,
  alt: 'Composite of Pioneer 10 observations of Jupiter, with Europa and Ganymede insets.',
  credit:
    'NASA · Pioneer 10 images. Composite; planet and moons are not to scale.',
}
export const dsn: SceneMedia = {
  src: `${root}dsn-goldstone.webp`,
  alt: 'Large radio dishes at NASA’s Goldstone Deep Space Network complex in the California desert.',
  credit:
    'NASA/JPL-Caltech · PIA23214, February 11, 2020. Context photograph, not the January 2003 reception.',
}

export const systems = [
  {
    id: 'antenna',
    name: 'High-Gain Antenna',
    text: 'The large dish directed radio communications toward Earth. Ground antennas listened for its faint signal across enormous distances.',
  },
  {
    id: 'power',
    name: 'Radioisotope Power Generators',
    text: 'Radioisotope thermoelectric generators converted heat from radioactive decay into electricity. Pioneer 10 did not use solar panels for electrical power.',
  },
  {
    id: 'magnetometer',
    name: 'Magnetometer',
    text: 'A sensor on a long boom measured magnetic fields. It helped investigate Jupiter’s magnetic environment.',
  },
  {
    id: 'science',
    name: 'Scientific Instruments',
    text: 'Instruments measured energetic particles, radiation and other properties of space. An imaging photopolarimeter built pictures by measuring light.',
  },
  {
    id: 'plaque',
    name: 'Pioneer Plaque',
    text: 'A physical plaque attached to the spacecraft carried symbolic information about humanity and its origin. It was not a message broadcast by radio.',
  },
] as const

export const beltOrder: EventOrderPrompt = {
  type: 'event-order',
  instruction: 'Arrange the outward journey using Up and Down.',
  steps: [
    { id: 'mars', label: 'Beyond Mars' },
    { id: 'belt', label: 'Through the asteroid belt' },
    { id: 'jupiter', label: 'Toward Jupiter' },
  ],
  initialOrder: ['belt', 'mars', 'jupiter'],
  correctOrder: ['mars', 'belt', 'jupiter'],
  explanation:
    'The main asteroid belt lies between the orbits of Mars and Jupiter. Pioneer 10 crossed it in 1972–1973.',
}
export const beltInterpretation: PredictionPrompt = {
  type: 'prediction-choice',
  instruction: 'What did this journey help demonstrate?',
  choices: [
    {
      id: 'wall',
      label:
        'The asteroid belt is a tightly packed wall requiring constant dodging.',
    },
    {
      id: 'space',
      label:
        'The belt is mostly empty space; measuring dust and debris helped assess spacecraft risks.',
    },
    {
      id: 'empty',
      label: 'There is no dust or debris anywhere in the asteroid belt.',
    },
  ],
  correctChoiceId: 'space',
  explanation:
    'There are large spaces between asteroids. Pioneer investigated real dust and debris hazards; it was not a movie-style obstacle course. A safe crossing does not mean every small-particle risk vanishes.',
}

export const scienceTargets = [
  {
    id: 'magnetic',
    title: 'Magnetic field',
    instrument: 'Magnetometer',
    question: 'Which instrument studies a magnetic field?',
    finding:
      'Pioneer 10 measured Jupiter’s strong magnetic field and its interaction with the solar wind. The region controlled by that field is called the magnetosphere.',
  },
  {
    id: 'radiation',
    title: 'Radiation environment',
    instrument: 'Particle and radiation detectors',
    question: 'Which instruments investigate energetic charged particles?',
    finding:
      'Detectors investigated intense radiation around Jupiter. Understanding that environment helped engineers prepare later spacecraft such as Voyager and Galileo.',
  },
  {
    id: 'clouds',
    title: 'Clouds and atmosphere',
    instrument: 'Imaging photopolarimeter',
    question: 'Which instrument builds pictures from measured light?',
    finding:
      'The imaging photopolarimeter returned close-up views of Jupiter’s cloud features. Other investigations, including radio occultation and infrared observations, also probed the atmosphere.',
  },
] as const
export const scienceInstrumentChoices = [
  'Magnetometer',
  'Particle and radiation detectors',
  'Imaging photopolarimeter',
] as const

export const plaqueSymbols = [
  {
    id: 'hydrogen',
    label: 'Hydrogen reference',
    x: 17,
    y: 14,
    meaningId: 'reference',
    text: 'The upper-left diagram shows two states of neutral hydrogen. It offers a shared physical reference for interpreting the plaque’s measurements.',
  },
  {
    id: 'pulsars',
    label: 'Pulsar map',
    x: 24,
    y: 49,
    meaningId: 'location',
    text: 'Lines point toward pulsars — stars that produce repeating pulses — and the galactic center. The pattern encodes the Sun’s location relative to these reference points.',
  },
  {
    id: 'humans',
    label: 'Human figures and spacecraft',
    x: 71,
    y: 48,
    meaningId: 'people',
    text: 'The figures depict humans beside the outline of the spacecraft. Their relative sizes provide a clue to human scale.',
  },
  {
    id: 'solar-system',
    label: 'Solar system diagram',
    x: 46,
    y: 88,
    meaningId: 'origin',
    text: 'The bottom diagram identifies Earth as the third planet from the Sun and traces the spacecraft’s departure. It is symbolic, not a map to scale.',
  },
] as const
export const plaqueMatch: EvidenceMatchPrompt = {
  type: 'evidence-match',
  instruction: 'Match each inspected symbol with its intended meaning.',
  evidence: plaqueSymbols.map((item) => ({
    id: item.id,
    label: item.label,
    meaningId: item.meaningId,
  })),
  meanings: [
    {
      id: 'people',
      label: 'Human appearance and scale relative to the spacecraft',
    },
    { id: 'origin', label: 'Earth as the spacecraft’s planet of origin' },
    {
      id: 'reference',
      label: 'A shared atomic reference for interpreting measurements',
    },
    {
      id: 'location',
      label: 'The Sun’s position relative to pulsars and the galactic center',
    },
  ],
  explanation:
    'Hydrogen provides a physical reference; pulsars help encode location; the figures show humans and scale; the solar-system diagram points to Earth. The plaque is a physical message, with no confirmed discovery or response by another civilization.',
}
export const signalQuestion: PredictionPrompt = {
  type: 'prediction-choice',
  instruction: 'Why did Earth eventually lose contact with Pioneer 10?',
  choices: [
    { id: 'destroyed', label: 'Jupiter destroyed the spacecraft in 1973.' },
    {
      id: 'faint',
      label:
        'Its available power declined and the already faint signal became undetectable.',
    },
    { id: 'landed', label: 'Pioneer 10 landed on a distant planet.' },
  ],
  correctChoiceId: 'faint',
  explanation:
    'Distance makes a radio signal harder to receive, while aging radioisotope generators supply less electrical power. The final detectable carrier was too weak to recover telemetry. Contact ended; the outward journey did not.',
}
export const legacyOrder: EventOrderPrompt = {
  type: 'event-order',
  instruction: 'Reconstruct the legacy from earliest to latest.',
  steps: [
    { id: 'launch', label: '1972 — Launch from Earth' },
    { id: 'belt', label: '1972–1973 — Crossing the asteroid belt' },
    { id: 'jupiter', label: '1973 — Jupiter flyby' },
    { id: 'signal', label: '2002–2003 — Final telemetry and detected signal' },
    { id: 'beyond', label: 'Beyond contact — Continued outward journey' },
  ],
  initialOrder: ['belt', 'launch', 'signal', 'jupiter', 'beyond'],
  correctOrder: ['launch', 'belt', 'jupiter', 'signal', 'beyond'],
  explanation:
    'Pioneer 10 flew past Jupiter rather than landing or entering orbit. It continues outward without active contact. The signal faded. The legacy travelled on.',
}

/** Derived teaching examples, never telemetry. Distance is in billions of km. */
export function lightDelay(distance: number): string {
  const minutes = Math.round((distance * 1e9) / 299792.458 / 60)
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`
}
