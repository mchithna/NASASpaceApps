import type { ReactNode } from 'react'
import { FileText } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import type { CitationView } from '@/engine/sceneRenderers.ts'
import type { SceneMedia } from '@/engine/scenes.ts'
import { SceneAttribution } from '@/engine/scenes/SceneAttribution.tsx'
import { SceneMediaView } from '@/engine/scenes/SceneMediaView.tsx'

export function SceneFrame({
  headingId,
  heading,
  body,
  emptyText,
  instruction,
  media,
  citation,
  requestedSourceCount,
  framing,
  action,
}: {
  headingId: string
  heading: string
  body?: string
  emptyText: string
  instruction?: string
  media?: SceneMedia | null
  citation: CitationView
  requestedSourceCount: number
  framing?: string
  action?: ReactNode
}) {
  const text = body?.trim() ?? ''

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h3
        id={headingId}
        className="font-heading text-xl font-semibold text-foreground"
      >
        {heading}
      </h3>
      {text === '' ? (
        <EmptyState icon={FileText} title="No scene text" description={emptyText} />
      ) : (
        <p className="max-w-[65ch] text-pretty text-secondary">{text}</p>
      )}
      {instruction ? (
        <p className="max-w-[65ch] text-secondary">
          <span className="font-medium text-foreground">Instruction. </span>
          {instruction}
        </p>
      ) : null}
      <SceneMediaView media={media} />
      <SceneAttribution
        citation={citation}
        requestedSourceCount={requestedSourceCount}
        framing={framing}
      />
      {action}
    </section>
  )
}
