import type { SceneMedia } from '@/engine/scenes.ts'

export const root = '/assets/missions/ingenuity/'
export const helicopterPhoto: SceneMedia = {
  src: `${root}ingenuity-mars.webp`,
  alt: 'Ingenuity stands on rocky Martian terrain, photographed by Perseverance on August 2, 2023.',
  credit: 'NASA/JPL-Caltech/ASU/MSSS · PIA25968, main view.',
}
export const sandPhoto: SceneMedia = {
  src: `${root}sand-ripples.webp`,
  alt: 'Relatively featureless sand ripples photographed by Ingenuity during Flight 70, December 22, 2023.',
  credit:
    'NASA/JPL-Caltech · PIA26242. Flight 70 context image, not Flight 72 footage.',
}
export const damagePhoto: SceneMedia = {
  src: `${root}damaged-rotor.webp`,
  alt: 'Ingenuity’s color camera shows the shadow of a damaged rotor blade after Flight 72.',
  credit:
    'NASA/JPL-Caltech · PIA26243. Captured after the January 18, 2024 flight.',
}
export const parts = [
  {
    id: 'rotors',
    name: 'Rotor blades',
    x: 69,
    y: 33,
    text: 'Four lightweight blades form two counter-rotating rotors. Their opposite spin helps control rotation while producing lift in thin air.',
  },
  {
    id: 'solar',
    name: 'Solar panel',
    x: 50,
    y: 15,
    text: 'Sunlight charges rechargeable batteries that supply the aircraft’s electrical energy.',
  },
  {
    id: 'camera',
    name: 'Navigation camera',
    x: 49,
    y: 66,
    text: 'A downward-looking camera tracks recognizable ground features. Onboard software combines images with sensor data to estimate motion.',
  },
  {
    id: 'body',
    name: 'Battery and electronics',
    x: 58,
    y: 54,
    text: 'A compact insulated body holds batteries, heaters and the flight computer. Ingenuity follows its uploaded plan autonomously.',
  },
  {
    id: 'legs',
    name: 'Landing legs',
    x: 73,
    y: 84,
    text: 'Four lightweight landing legs support the aircraft on the surface. Safe terrain and controlled descent both matter.',
  },
] as const

export const commands = {
  type: 'event-order' as const,
  instruction:
    'Prepare the onboard sequence. Move the command cards into flight order.',
  steps: [
    { id: 'spin', label: 'Spin Up Rotors' },
    { id: 'takeoff', label: 'Take Off' },
    { id: 'hover', label: 'Hover' },
    { id: 'land', label: 'Land Safely' },
  ],
  initialOrder: ['takeoff', 'spin', 'land', 'hover'],
  correctOrder: ['spin', 'takeoff', 'hover', 'land'],
  explanation:
    'Rotors must produce lift before takeoff; a stable hover comes before the planned descent and landing.',
}
export const timeline = {
  type: 'event-order' as const,
  instruction: 'Rebuild the journey from earliest to latest using Up and Down.',
  steps: [
    {
      id: 'arrival',
      label: 'Perseverance carries Ingenuity to Mars — February 18, 2021',
    },
    { id: 'first', label: 'First powered, controlled flight — April 19, 2021' },
    {
      id: 'extended',
      label: 'Five-flight demonstration becomes an extended mission',
    },
    {
      id: 'last',
      label: 'Flight 72 ends the flying journey — January 18, 2024',
    },
  ],
  initialOrder: ['first', 'arrival', 'last', 'extended'],
  correctOrder: ['arrival', 'first', 'extended', 'last'],
  explanation:
    'Five flights were the plan. Seventy-two became the legacy. NASA announced the end of the flying mission on January 25, 2024.',
}
