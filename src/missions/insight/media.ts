import type { SceneMedia } from '@/engine/scenes.ts'

const root = '/assets/missions/insight/'

export const lastSeismometer: SceneMedia = {
  src: `${root}last-seismometer.jpg`,
  alt: 'One of InSight’s last photographs, taken December 11, 2022. The seismometer’s dome sits on the Martian surface beside the lander.',
  credit:
    'NASA/JPL-Caltech · PIA25680. Sol 1,436. The dome is the seismometer on the surface.',
}

export const firstSelfie: SceneMedia = {
  src: `${root}first-selfie.jpg`,
  alt: 'InSight’s first full selfie on Mars, December 6, 2018. The solar panels are clean and the science instruments are still on the deck. Black areas are gaps in the stitched camera mosaic.',
  credit:
    'NASA/JPL-Caltech · PIA22876. Eleven Instrument Deployment Camera frames from sol 10.',
}

export const seisPlacement: SceneMedia = {
  src: `${root}seis-on-mars.jpg`,
  alt: 'InSight’s white robotic arm holds the copper-colored seismometer just above the Martian ground on December 19, 2018. The wind and thermal shield is not in this photograph.',
  credit:
    'NASA/JPL-Caltech · PIA22956. SEIS being placed on Mars, December 19, 2018, around dusk.',
}

export const interiorDiagram: SceneMedia = {
  src: `${root}interior-layers.jpg`,
  alt: 'NASA illustration titled Inside Mars. A cutaway shows interior layers, seismic paths, InSight on the surface, cracking rock, and a meteorite impact. It is an illustration, not a measured scale model.',
  credit:
    'NASA/JPL-Caltech · PIA25282. How InSight studies the crust, mantle, and core.',
}

export const panelDust: SceneMedia = {
  src: `${root}panel-dust.jpg`,
  alt: 'NASA chart titled InSight Power Comparison. The left photograph is the December 6, 2018 selfie. The right photograph is the dustier selfie from March and April 2019, although the chart labels it Now. The bars mark about 5,000 watt-hours after landing and about 500 watt-hours by spring 2022. Those energy figures are NASA measurements, not results from the slider.',
  credit:
    'NASA/JPL-Caltech · PIA25284. The right photograph is from 2019. The 500 watt-hour figure is the spring 2022 measurement.',
}

export const finalSelfie: SceneMedia = {
  src: `${root}final-selfie.jpg`,
  alt: 'InSight’s final selfie, April 24, 2022, sol 1,211. Dust covers the solar panels much more than in the December 2018 selfie. Black areas are gaps in the stitched camera mosaic.',
  credit: 'NASA/JPL-Caltech · PIA25287. Final selfie before the arm was parked.',
}
