/**
 * Mocked AI response service for the Nova AI Chatbot.
 * Provides fast, factual, simulated responses about NASA missions and concepts
 * formatted in Markdown for rich presentation before live AI services are connected.
 */

export async function getMockReply(question: string): Promise<string> {
  // Realistic short thinking delay (500-700ms)
  await new Promise((resolve) => setTimeout(resolve, 600))

  const q = question.toLowerCase().trim()

  if (q.includes('surveyor')) {
    return `**Surveyor 3** was a robotic lunar lander that touched down on the Moon's **Ocean of Storms** in April 1967.

Key highlights:
- Tested the lunar soil bearing strength before Apollo missions.
- In November 1969, **Apollo 12 astronauts** Pete Conrad and Alan Bean landed nearby and walked over to inspect it!
- Astronauts brought its television camera back to Earth to study long-term radiation and space exposure.

Explore more on [NASA's Surveyor 3](https://science.nasa.gov/mission/surveyor-3/).`
  }

  if (q.includes('opportunity') || (q.includes('mars') && q.includes('water'))) {
    return `**Opportunity** (*MER-B*) was one of NASA's most successful planetary explorers. Designed for a 90-sol mission, it explored Mars for nearly **15 years**!

Key discoveries:
- Discovered hematite spherules nicknamed **"blueberries"**, formed in ancient acidic water.
- Traversed craters like **Eagle**, **Endurance**, and **Victoria**, discovering clear evidence that liquid water once flowed across Mars.
- Drove over **45 kilometers (28 miles)**, setting an off-world driving record.

Read more at [NASA's Opportunity Mission](https://science.nasa.gov/mission/mer-opportunity/).`
  }

  if (q.includes('ingenuity') || q.includes('helicopter') || q.includes('fly')) {
    return `**Ingenuity** demonstrated the first powered, controlled flight on another planet!

Key achievements:
- Flew in an atmosphere with **less than 1% of Earth's density**, using ultra-light carbon-fiber blades spinning at ~2,400 RPM.
- Designed as a 5-flight tech demo, it completed **72 flights** across Jezero Crater.
- Served as an aerial scout for the Perseverance rover, mapping safe paths across dunes and boulder fields.

Read more at [NASA's Ingenuity Helicopter](https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/).`
  }

  if (q.includes('insight') || q.includes('marsquake') || q.includes('interior')) {
    return `**InSight** was a stationary lander that explored the deep interior of Mars.

Key findings:
- Deployed a ultra-sensitive dome-covered seismometer (**SEIS**).
- Recorded over **1,300 marsquakes**, revealing that Mars has an active, trembling crust.
- Measured the thickness of the Martian crust and mapped its liquid metallic core.

Read more at [NASA's InSight Mission](https://science.nasa.gov/mission/insight/).`
  }

  if (
    q.includes('farthest') ||
    q.includes('far') ||
    q.includes('pioneer') ||
    q.includes('jupiter')
  ) {
    return `**Pioneer 10** went the farthest of the five missions featured on NovaExplorer!

Key milestones:
- Launched in **1972**, it was the first spacecraft to safely traverse the asteroid belt.
- First probe to obtain close-up images of **Jupiter** and its radiation belts.
- Now traveling through **deep interstellar space**, billions of miles away from the Sun.

Read more at [NASA's Pioneer 10](https://science.nasa.gov/mission/pioneer-10/).`
  }

  if (q.includes('telemetry')) {
    return `**Telemetry** is the automated collection and transmission of data from remote sensors.

In deep space exploration:
- Spacecraft continuously send engineering metrics (temperatures, battery voltages, thruster pressure) and scientific sensor readings back to Earth.
- Signals travel across space and are collected by the **NASA Deep Space Network (DSN)** giant radio antennas in California, Spain, and Australia.

Learn more at the [NASA Deep Space Network](https://www.nasa.gov/directorates/somd/space-communications-navigation-program/dsn-functions/).`
  }

  if (
    q.includes('xp') ||
    q.includes('invent') ||
    q.includes('cheat') ||
    q.includes('award')
  ) {
    return `I cannot award XP, generate fictional quotes, or modify explorer progress.

To earn XP and rank promotions:
- Open **Mission Control** and play through historical chapters like **Surveyor 3** and **Opportunity**.
- Inspect authentic hardware, test evidence, and solve historical challenges!`
  }

  if (q.includes('help') || q.includes('what can you do')) {
    return `I'm **Nova**, your NASA educational guide!

You can ask me about:
- **The 5 missions**: Surveyor 3, Opportunity, Ingenuity, InSight, and Pioneer 10.
- **Space science**: Marsquakes, ancient water, powered flight in thin atmospheres, and deep-space telemetry.
- **How to play**: Navigating Mission Control, collecting discoveries in your Journal, and earning badges!`
  }

  // General helpful response for any other mission or query
  return `That's a great question about space exploration!

On NovaExplorer, you can explore five key historical missions:
1. **Surveyor 3** — Robotic Moon lander inspected by Apollo 12 astronauts.
2. **Opportunity** — The 15-year Mars rover that uncovered water-soaked history.
3. **Ingenuity** — The pioneering helicopter that flew 72 times on Mars.
4. **InSight** — The Mars seismic station that detected over 1,300 marsquakes.
5. **Pioneer 10** — The legendary probe venturing into deep interstellar space.

Ask me about any of these missions or space science concepts!`
}
