import { useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader.tsx'
import { textLinkClass } from '@/components/layout/layoutClasses.ts'
import type { MissionDefinition } from '@/missions/types.ts'
import { ExternalLink } from 'lucide-react'

type MissionFactsProps = {
  mission: MissionDefinition
}

export function MissionFacts({ mission }: MissionFactsProps) {
  useEffect(() => {
    document.title = `${mission.displayName} · NovaExplorer`
  }, [mission.displayName])

  return (
    <div className="flex flex-col gap-8 animate-page-rise">
      <div className="flex flex-col gap-2">
        <div className="eyebrow-label">
          <span className="eyebrow-dot" /> NASA SPACECRAFT DOSSIER
        </div>
        <PageHeader
          title={mission.displayName}
          description={mission.description}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4 p-6 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
          <p className="max-w-[65ch] text-[#9aa7bd] text-sm">
            <span className="font-semibold text-white">Story title: </span>
            <span className="text-[#d4ff9a] font-medium">{mission.chapterTitle}</span>
          </p>
          <p className="text-[#9aa7bd] text-sm">
            <span className="font-semibold text-white">Destination: </span>
            <span className="text-white">{mission.destination}</span>
          </p>
          <p className="max-w-[65ch] text-white/90 text-sm">
            Mission gameplay is not implemented yet.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#050a14] aspect-video">
          <img
            src={mission.coverImage}
            alt="Placeholder cover. A NASA photograph is not shown yet."
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>

      <section className="flex flex-col gap-3 p-6 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
        <h2 className="text-lg font-heading font-semibold text-white">
          NASA source
        </h2>
        <ul className="flex flex-col gap-2.5">
          {mission.sources.map((source) => (
            <li key={source.id}>
              <a
                className={`${textLinkClass} inline-flex items-center gap-1.5 text-sm text-[#53cbff] hover:text-[#d4ff9a] hover:underline transition-colors`}
                href={source.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                <span>{source.title}</span>
                <ExternalLink size={13} aria-hidden="true" />
                {source.credit ? (
                  <span className="font-normal text-[#8c9bb3] ml-1">
                    ({source.credit})
                  </span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
