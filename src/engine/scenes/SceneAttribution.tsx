import { Badge } from '@/components/ui/Badge.tsx'
import { textLinkClass } from '@/components/layout/layoutClasses.ts'
import type { CitationView } from '@/engine/sceneRenderers.ts'
import type { SceneFraming } from '@/engine/scenes.ts'
import { framingBadge, framingNote, readFraming } from '@/engine/scenes/presentation.ts'
import { safeExternalUrl } from '@/engine/scenes/urls.ts'

export function SceneAttribution({
  citation,
  requestedSourceCount,
  framing,
}: {
  citation: CitationView
  requestedSourceCount: number
  framing?: string
}) {
  const knownFraming: SceneFraming | undefined = readFraming(framing)
  const badge = framingBadge(knownFraming)
  const unmatched = requestedSourceCount > citation.sources.length

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-base font-medium text-foreground">How to read this scene</h4>
      {badge ? (
        <Badge variant={knownFraming === 'hypothetical' ? 'warning' : 'neutral'}>
          {badge}
        </Badge>
      ) : null}
      <p className="text-sm text-secondary">{citation.label}</p>
      <p className="max-w-[65ch] text-sm text-secondary">
        {framingNote(citation.narration, knownFraming)}
      </p>
      {citation.sources.length === 0 ? (
        <p className="text-sm text-secondary">This scene does not cite a NASA source.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {citation.sources.map((source) => {
            const href = safeExternalUrl(source.url)
            return (
              <li key={source.id} className="flex flex-col gap-1">
                {href ? (
                  <a
                    className={textLinkClass}
                    href={href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {source.title}
                  </a>
                ) : (
                  <>
                    <span className="text-sm text-foreground">{source.title}</span>
                    <p className="text-sm text-secondary">
                      The link was left out because it is not a normal web address.
                    </p>
                  </>
                )}
                {source.credit ? (
                  <span className="text-sm text-muted">{source.credit}</span>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
      {unmatched ? (
        <p className="text-sm text-secondary">
          A listed source is not on this mission, so no link was added.
        </p>
      ) : null}
    </div>
  )
}
