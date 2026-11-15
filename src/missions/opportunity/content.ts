import type { SceneMedia } from '@/engine/scenes.ts'

export const assetRoot = '/assets/missions/opportunity/'
export const panorama: SceneMedia = {
  src: `${assetRoot}final-panorama.jpg`,
  alt: 'Opportunity’s final panorama across Perseverance Valley, with tracks and exposed rocks.',
  credit:
    'NASA/JPL-Caltech/Cornell/ASU · PIA22909. Approximate true color; some frames remain monochrome.',
}

export const equipment = [
  {
    name: 'Panoramic Camera',
    detail:
      'Pancam surveyed the landscape so scientists could choose promising rocks and routes.',
    x: 56,
    y: 16,
  },
  {
    name: 'Microscopic Imager',
    detail:
      'Close-up black-and-white pictures revealed textures in rocks and soil.',
    x: 25,
    y: 65,
  },
  {
    name: 'Spectrometers',
    detail:
      'Instruments measured mineral and element composition, helping scientists interpret how rocks formed.',
    x: 37,
    y: 58,
  },
  {
    name: 'Rock Abrasion Tool',
    detail:
      'A grinding wheel removed weathered surfaces to expose fresh rock for investigation.',
    x: 20,
    y: 76,
  },
  {
    name: 'Solar panels',
    detail:
      'Sunlight supplied electrical energy for instruments, movement and communication.',
    x: 72,
    y: 45,
  },
  {
    name: 'Six wheels',
    detail:
      'The wheels carried the rover between scientific targets across the surface.',
    x: 73,
    y: 80,
  },
] as const

export const clues = [
  {
    name: 'Hematite-rich spheres',
    detail:
      'Nicknamed blueberries, these rounded mineral-rich grains supported an interpretation of groundwater altering the rocks.',
    image: 'blueberries.jpg',
    credit: 'NASA/JPL · PIA05564. Microscopic Imager mosaic.',
  },
  {
    name: 'Sedimentary rock layers',
    detail:
      'Layers preserve a sequence of deposits. Their structures, together with mineral evidence, helped scientists reconstruct changing ancient environments.',
    image: 'eagle-crater.jpg',
    credit:
      'NASA/JPL/Cornell · PIA05755. Approximate true color panorama at Eagle Crater.',
  },
] as const

export const stops = [
  {
    name: 'Eagle Crater',
    date: '2004',
    image: 'eagle-crater.jpg',
    credit: 'NASA/JPL/Cornell · PIA05755. Approximate true color.',
    objective: 'Investigate the landing site for evidence of ancient water.',
    target: 'Inspect the outcrop',
    finding:
      'Hematite-rich spheres and layered outcrops helped reveal a history affected by water.',
  },
  {
    name: 'Endurance Crater',
    date: '2004',
    image: 'endurance-shadow.jpg',
    credit: 'NASA/JPL-Caltech. Hazard-camera image, July 26, 2004.',
    objective:
      'Read the exposed rock layers as a record of geological history.',
    target: 'Examine the rock layers',
    finding:
      'Different layers preserve different chapters of Mars’s environmental history. The rover investigated deeper into this crater.',
  },
  {
    name: 'Victoria Crater',
    date: '2006–2008',
    image: 'victoria-crater.jpg',
    credit: 'NASA/JPL-Caltech/Cornell. View from Cape Verde.',
    objective: 'Investigate exposed geological formations in a larger crater.',
    target: 'Observe the crater wall',
    finding:
      'Exposed formations gave scientists another window into the rocks beneath the surface. Exploration continued far beyond the primary mission.',
  },
  {
    name: 'Endeavour Crater',
    date: '2011 onward',
    image: 'endeavour-crater.jpg',
    credit:
      'NASA/JPL-Caltech/Cornell Univ./Arizona State Univ. Pillinger Point.',
    objective: 'Reach a region with further clues about ancient water.',
    target: 'Open the investigation area',
    finding:
      'Rocks near the rim preserved evidence of different watery environments. Next, compare gypsum veins and clay-bearing rocks.',
  },
] as const

// Intended trusted journal content. Mission activities send only opportunity-notes.
// The integration owner must publish this in the shared guest and database catalogs.
export const discoveryPublication = {
  discoveryId: 'opportunity-notes',
  missionId: 'opportunity',
  title: 'The Ancient Water of Mars',
  summary:
    'Hematite-rich spheres point to groundwater activity; gypsum veins record minerals deposited by water in fractures; clay-bearing rocks preserve evidence of a less acidic ancient watery environment. These findings concern past habitability, not proof of life.',
  sourceUrl:
    'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/science-highlights/',
  contentStatus: 'sourced',
} as const
