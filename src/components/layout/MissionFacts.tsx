import { useEffect, type ReactNode } from 'react'
import { ArrowUpRight, Orbit, Radio, Sparkles } from 'lucide-react'
import type { MissionDefinition } from '@/missions/types.ts'
import { PageHero } from '@/pages/components/PageHero.tsx'

export function MissionFacts({
  mission,
  actions,
}: {
  mission: MissionDefinition
  actions?: ReactNode
}) {
  useEffect(() => {
    document.title = `${mission.displayName} · NovaExplorer`
  }, [mission.displayName])
  const available = mission.status === 'available'
  return (
    <div className="platform-page">
      <PageHero
        title={mission.displayName}
        description={mission.chapterTitle}
        eyebrow={`${mission.destination} / Mission dossier`}
        visual={mission.id}
        actions={actions}
      />
      <div className="mission-dossier-grid">
        <section className="mission-dossier-panel">
          <p className="platform-eyebrow">
            <Orbit size={15} aria-hidden="true" />
            The story behind the spacecraft
          </p>
          <h2>{mission.chapterTitle}</h2>
          <p>{mission.description}</p>
          <dl>
            <div>
              <dt>Destination</dt>
              <dd>{mission.destination}</dd>
            </div>
            <div>
              <dt>Mission rewards</dt>
              <dd>Up to 100 XP</dd>
            </div>
          </dl>
          <div className="mt-7 flex items-start gap-3 rounded-control border border-border p-4">
            {available ? (
              <Sparkles
                className="mt-1 size-5 shrink-0 text-accent"
                aria-hidden="true"
              />
            ) : (
              <Radio
                className="mt-1 size-5 shrink-0 text-science"
                aria-hidden="true"
              />
            )}
            <p>
              {available
                ? 'Your chapter is ready. Follow the story, investigate the evidence, and uncover the legacy.'
                : 'This chapter is being prepared. Explore the NASA sources while the mission team prepares the story.'}
            </p>
          </div>
        </section>
        <aside
          className="mission-dossier-panel"
          aria-label="Mission reading sources"
        >
          <p className="platform-eyebrow">From the original archives</p>
          <h2>NASA source</h2>
          <p>
            Follow the evidence. Explore the original mission records and the
            science behind this story.
          </p>
          <ul className="mission-source-list">
            {mission.sources.map((source) => (
              <li key={source.id}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  <span>
                    {source.title}
                    {source.credit ? <small>{source.credit}</small> : null}
                  </span>
                  <ArrowUpRight size={18} aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
