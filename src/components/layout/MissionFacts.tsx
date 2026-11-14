import { useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader.tsx'
import { textLinkClass } from '@/components/layout/layoutClasses.ts'
import type { MissionDefinition } from '@/missions/types.ts'

type MissionFactsProps = {
  mission: MissionDefinition
}

export function MissionFacts({ mission }: MissionFactsProps) {
  useEffect(() => {
    document.title = `${mission.displayName} · NovaExplorer`
  }, [mission.displayName])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={mission.displayName}
        description={mission.description}
      />
      <p className="max-w-[65ch] text-secondary">
        <span className="font-medium text-foreground">Story title: </span>
        {mission.chapterTitle}
      </p>
      <p className="text-secondary">
        <span className="font-medium text-foreground">Destination: </span>
        {mission.destination}
      </p>
      <img
        src={mission.coverImage}
        alt="Placeholder cover. A NASA photograph is not shown yet."
        className="w-full max-w-xl rounded-surface border border-border bg-surface"
      />
      <p className="max-w-[65ch] text-foreground">
        Mission gameplay is not implemented yet.
      </p>
      <section className="flex flex-col gap-2">
        <h2 className="text-xl text-foreground">NASA source</h2>
        <ul className="flex flex-col gap-2">
          {mission.sources.map((source) => (
            <li key={source.id}>
              <a className={textLinkClass} href={source.url}>
                {source.title}
              </a>
              {source.credit ? (
                <span className="text-muted"> ({source.credit})</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
