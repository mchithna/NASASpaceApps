import type { GroundingSource } from './types.ts'

export interface MissionKnowledge {
  id: string
  name: string
  target: string
  dates: string
  summary: string
  simpleSummary: string
  keyFacts: string[]
  instruments: string[]
  significance: string
  sources: GroundingSource[]
}

export const NASA_MISSIONS_KNOWLEDGE: Record<string, MissionKnowledge> = {
  'surveyor-3': {
    id: 'surveyor-3',
    name: 'Surveyor 3',
    target: 'Ocean of Storms (Moon)',
    dates: 'April 1967 – Apollo 12 retrieval in November 1969',
    summary:
      'Landed inside a lunar crater in April 1967. It used a surface sampler scoop to dig trenches and prove the lunar soil could support astronauts. In November 1969, Apollo 12 astronauts Pete Conrad and Alan Bean landed nearby and brought back parts, including its camera, to test long-term space exposure.',
    simpleSummary:
      'A robotic Moon lander that dug into the lunar soil to test if the ground was firm enough for Apollo astronauts. Astronauts later visited it and brought its camera back to Earth!',
    keyFacts: [
      'Bounced three times on touchdown before settling on the crater slope.',
      'Dug four trenches up to 7 inches (18 cm) deep.',
      'Only robotic spacecraft visited by humans on another celestial world.',
    ],
    instruments: [
      'Television camera',
      'Surface sampler scoop',
      'Strain gauges',
    ],
    significance:
      'Gave scientists vital data on how the harsh lunar vacuum, radiation, and micrometeorites affect materials over time.',
    sources: [
      {
        title: 'NASA Surveyor 3 Mission Overview',
        url: 'https://science.nasa.gov/mission/surveyor-3/',
        relevance: 'Official NASA science and landing details',
      },
      {
        title: 'Lunar and Planetary Institute: Surveyor 3',
        url: 'https://www.lpi.usra.edu/lunar/missions/surveyor/surveyor_3/',
        relevance: 'Photographs, surface sampler results, and Apollo 12 visit',
      },
    ],
  },
  opportunity: {
    id: 'opportunity',
    name: 'Opportunity (MER-B)',
    target: 'Meridiani Planum (Mars)',
    dates: 'January 2004 – February 2019',
    summary:
      'A golf-cart-sized rover that operated for nearly 15 years on Mars, far exceeding its planned 90-day mission. It drove 28.06 miles (45.16 km) and discovered hematite spherules nicknamed "blueberries", proving liquid water once soaked the Martian surface.',
    simpleSummary:
      'A long-lived Mars rover that worked for 15 years instead of just 3 months! It found tiny gray spheres of hematite nicknamed "blueberries" that prove liquid water once existed on Mars.',
    keyFacts: [
      'Set the off-world driving record of 28.06 miles (45.16 km).',
      'Discovered microscopic hematite blueberries formed in acidic water.',
      'Explored Eagle, Endurance, Victoria, and Endeavour craters.',
      'Its final transmission occurred during a catastrophic global dust storm in June 2018.',
    ],
    instruments: [
      'Panoramic Camera (Pancam)',
      'Mini-TES infrared spectrometer',
      'Mössbauer Spectrometer',
      'Alpha Particle X-Ray Spectrometer (APXS)',
      'Rock Abrasion Tool (RAT)',
    ],
    significance:
      'Transformed our understanding of ancient Martian habitability by establishing that liquid water flowed and pooled on ancient Mars.',
    sources: [
      {
        title: 'NASA Mars Exploration Rover: Opportunity',
        url: 'https://science.nasa.gov/mission/mer-opportunity/',
        relevance: 'Mission timeline, milestones, and science instruments',
      },
      {
        title: 'NASA JPL Opportunity Rover Legacy',
        url: 'https://www.jpl.nasa.gov/missions/mars-exploration-rover-opportunity-mer',
        relevance: 'Driving records and crater exploration findings',
      },
    ],
  },
  ingenuity: {
    id: 'ingenuity',
    name: 'Ingenuity Mars Helicopter',
    target: 'Jezero Crater (Mars)',
    dates: 'April 2021 – January 2024',
    summary:
      'The first powered, controlled aircraft flown on another planet. Operating in Mars’ ultra-thin atmosphere (less than 1% of Earth’s surface pressure), Ingenuity completed 72 flights, traveled 10.5 miles (17.0 km), and served as an aerial scout for the Perseverance rover before damaging a rotor blade on Flight 72.',
    simpleSummary:
      'A small 4-pound robotic helicopter that proved aircraft can fly in the super-thin air of Mars! It flew 72 times across Jezero Crater to scout safe routes for the Perseverance rover.',
    keyFacts: [
      'Completed the historic first powered flight on another planet on April 19, 2021.',
      'Twin carbon-fiber counter-rotating blades spin at roughly 2,400 to 2,700 RPM.',
      'Flew 72 times and logged over 2 hours of total Martian flight time.',
      'Retired honorably after blade impact damage on January 18, 2024.',
    ],
    instruments: [
      'High-resolution color terrain camera (13 MP)',
      'Black-and-white downward navigation camera',
      'Inertial Measurement Unit (IMU)',
      'Laser rangefinder altimeter',
    ],
    significance:
      'Opened a new dimension of planetary exploration, proving powered atmospheric flight is possible on other worlds and paving the way for future aerial drones.',
    sources: [
      {
        title: 'NASA Mars Helicopter: Ingenuity',
        url: 'https://science.nasa.gov/mission/ingenuity/',
        relevance: 'Flight log, specifications, and Mars aerodynamics',
      },
      {
        title: 'NASA JPL Flight 72 Assessment',
        url: 'https://www.jpl.nasa.gov/news/after-three-years-on-mars-nasas-ingenuity-helicopter-mission-ends',
        relevance: 'Final mission status and rotor blade damage analysis',
      },
    ],
  },
  insight: {
    id: 'insight',
    name: 'InSight Lander',
    target: 'Elysium Planitia (Mars)',
    dates: 'November 2018 – December 2022',
    summary:
      'A stationary lander dedicated to investigating the deep interior of Mars. Its ultra-sensitive seismometer (SEIS) detected over 1,300 marsquakes, revealing the thickness and layering of the Martian crust, the size of its molten iron core, and current seismic activity.',
    simpleSummary:
      'A robotic lander equipped with an ultra-sensitive seismometer to listen to vibrations inside Mars! It recorded over 1,300 "marsquakes" to map the planet\'s crust, mantle, and molten core.',
    keyFacts: [
      'Detected over 1,319 marsquakes, including meteorite impacts that left fresh craters.',
      'Discovered Mars has a liquid metallic core approximately 1,140 miles (1,830 km) in radius.',
      'Measured atmospheric wind, temperature, and magnetic fluctuations.',
      'Operated until dust accumulation covered its solar arrays in December 2022.',
    ],
    instruments: [
      'Seismic Experiment for Interior Structure (SEIS)',
      'Heat Flow and Physical Properties Package (HP3)',
      'Rotation and Interior Structure Experiment (RISE)',
      'Auxiliary Payload Sensor Suite (APSS)',
    ],
    significance:
      'Produced the first complete map of the interior layers of another rocky planet, showing Mars is still seismically alive.',
    sources: [
      {
        title: 'NASA InSight Mission Overview',
        url: 'https://science.nasa.gov/mission/insight/',
        relevance: 'Marsquake catalog and core measurements',
      },
      {
        title: 'NASA JPL SEIS Instrument Science',
        url: 'https://www.jpl.nasa.gov/missions/insight',
        relevance: 'Seismometer deployment and Martian interior discoveries',
      },
    ],
  },
  'pioneer-10': {
    id: 'pioneer-10',
    name: 'Pioneer 10',
    target: 'Jupiter and the Outer Solar System',
    dates: 'March 1972 – Last signal January 2003',
    summary:
      'The first human spacecraft to travel through the Asteroid Belt and fly past Jupiter (December 1973). It provided the first close-up images of Jupiter and its moons, mapped Jupiter’s intense radiation belts, and became the first human-made object on an interstellar trajectory out of the solar system, carrying the iconic gold-anodized aluminum Pioneer Plaque.',
    simpleSummary:
      'The first spacecraft to safely fly through the Asteroid Belt and visit giant Jupiter! It took the first close-up photos of the Great Red Spot and carried a golden plaque showing friendly information about Earth.',
    keyFacts: [
      'First spacecraft to traverse the Asteroid Belt, finding it far less dense than feared.',
      'Flew within 81,000 miles (130,000 km) of Jupiter’s cloud tops on December 4, 1973.',
      'Carries a gold-anodized plaque designed by Carl Sagan and Linda Salzman Sagan.',
      'Sent its final faint signal across 7.5 billion miles in January 2003.',
    ],
    instruments: [
      'Imaging Photopolarimeter',
      'Helium Vector Magnetometer',
      'Quadrispherical Plasma Analyzer',
      'Cosmic Ray Telescope',
      'Asteroid-Meteoroid Detector',
    ],
    significance:
      'Pathfinder for the Voyager, Galileo, Cassini, and New Horizons missions, demonstrating that robotic probes could survive the outer solar system.',
    sources: [
      {
        title: 'NASA Pioneer 10 Mission Page',
        url: 'https://science.nasa.gov/mission/pioneer-10/',
        relevance: 'Jupiter encounter details and deep-space trajectory',
      },
      {
        title: 'NASA Solar System Exploration: Pioneer 10',
        url: 'https://solarsystem.nasa.gov/missions/pioneer-10/in-depth/',
        relevance: 'Pioneer Plaque symbolism and final signal communications',
      },
    ],
  },
}

export function buildSystemPrompt(options: {
  missionId?: string
  simple?: boolean
  persona?: 'guide' | 'commander' | 'copilot'
  contextData?: {
    rank?: string
    xp?: number
    completedMissions?: string[]
    currentSceneTitle?: string
    currentSceneType?: string
  }
}): string {
  const mission = options.missionId
    ? NASA_MISSIONS_KNOWLEDGE[options.missionId]
    : undefined

  let prompt = `You are NOVA, the intelligent educational AI guide and Mission Commander for NovaExplorer (NASA Space Apps Challenge 2026).
Your learners are students aged 10–17 discovering NASA's abandoned and historic equipment.

CORE RULES:
1. Grounding: All mission facts, dates, measurements, and discoveries MUST match real NASA history and science. Never invent false NASA facts, false telemetry, or fake space discoveries.
2. Tone: Friendly, encouraging, inspiring, clear, and scientifically rigorous.
3. Clarity: ${
    options.simple
      ? 'EXPLAIN SIMPLY: Use simple, everyday vocabulary, vivid analogies, and short sentences suitable for a 10-year-old explorer. Avoid confusing jargon.'
      : 'Explain concepts clearly with engaging scientific explanations, appropriate for middle and high school students.'
  }
4. Safety: Never ask for or store personal information (names, emails, passwords). Never generate inappropriate or harmful content.
5. Honesty: If asked about future or speculative missions, explicitly state what is historical NASA fact versus educational simulation. Never claim to have live real-time spacecraft telemetry if the spacecraft is retired or defunct.
6. Boundaries: You cannot modify player XP, grant achievements, or bypass mission activities. You can provide educational hints and scientific context.
`

  if (options.persona === 'commander') {
    prompt += `\nROLE: You are acting as NOVA MISSION COMMANDER in Mission Control.
Provide strategic learning guidance, celebrate the explorer's rank (${options.contextData?.rank ?? 'Cadet'}) and XP (${options.contextData?.xp ?? 0}), and recommend the best next mission to explore based on their learning path.`
  } else if (options.persona === 'copilot') {
    prompt += `\nROLE: You are acting as NOVA COPILOT inside a mission chapter.
Current Scene: "${options.contextData?.currentSceneTitle ?? 'Mission Scene'}" (${options.contextData?.currentSceneType ?? 'Activity'}).
Help the student understand the science, instruments, and evidence for this scene. Provide clues and conceptual explanations if they are stuck, but DO NOT give away the exact answer immediately.`
  }

  if (mission) {
    prompt += `\nCURRENT SPACECRAFT CONTEXT:
Spacecraft: ${mission.name} (${mission.id})
Target: ${mission.target}
Historical Period: ${mission.dates}
Summary: ${mission.summary}
Key Facts:
${mission.keyFacts.map((f) => `- ${f}`).join('\n')}
Instruments: ${mission.instruments.join(', ')}
Significance: ${mission.significance}
`
  }

  return prompt
}

export function getGroundingSources(
  missionId?: string,
  query?: string,
): GroundingSource[] {
  const sources: GroundingSource[] = []

  if (missionId && NASA_MISSIONS_KNOWLEDGE[missionId]) {
    sources.push(...NASA_MISSIONS_KNOWLEDGE[missionId].sources)
  }

  // Check query keywords for other relevant missions
  if (query) {
    const lower = query.toLowerCase()
    for (const [id, mission] of Object.entries(NASA_MISSIONS_KNOWLEDGE)) {
      if (id !== missionId && lower.includes(id)) {
        sources.push(...mission.sources)
      } else if (lower.includes(mission.name.toLowerCase())) {
        sources.push(...mission.sources)
      }
    }
  }

  // Always supply NASA general reference if empty
  if (sources.length === 0) {
    sources.push({
      title: 'NASA Solar System Exploration',
      url: 'https://science.nasa.gov/',
      relevance: 'NASA official science and planetary missions archive',
    })
  }

  return sources.slice(0, 3)
}

export function generateSuggestedQuestions(
  missionId?: string,
): string[] {
  const mission = missionId ? NASA_MISSIONS_KNOWLEDGE[missionId] : undefined

  if (mission) {
    return [
      `What instruments did ${mission.name} carry?`,
      `Why was ${mission.name} left behind on ${mission.target.split(' ')[0]}?`,
      `What was the biggest discovery made by ${mission.name}?`,
      `How does ${mission.name} compare to modern missions?`,
    ]
  }

  return [
    'What happened to Opportunity on Mars?',
    'How did Ingenuity fly in thin air?',
    'What did Apollo 12 find on Surveyor 3?',
    'Where is Pioneer 10 traveling now?',
  ]
}
