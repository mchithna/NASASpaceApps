import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import type { SceneMedia } from '@/engine/scenes.ts'
import { safeMediaSrc } from '@/engine/scenes/urls.ts'

type MediaPhase = 'loading' | 'ready' | 'error'

export function SceneMediaView({ media }: { media: SceneMedia | null | undefined }) {
  const [phase, setPhase] = useState<MediaPhase>('loading')

  if (media === undefined) {
    return null
  }

  if (media === null || media.src.trim() === '') {
    return (
      <EmptyState
        icon={ImageOff}
        title="No picture"
        description="No picture was added for this scene."
      />
    )
  }

  if (media.alt.trim() === '') {
    return (
      <ErrorState
        title="Picture needs a description"
        message="This picture was left out because it has no description."
      />
    )
  }

  const src = safeMediaSrc(media.src)
  if (!src) {
    return (
      <ErrorState
        title="Picture link blocked"
        message={`${media.alt} The picture address is not a normal web address, so it was not loaded.`}
      />
    )
  }

  if (phase === 'error') {
    return (
      <ErrorState
        title="Picture unavailable"
        message={`${media.alt} The picture could not be shown.`}
      />
    )
  }

  return (
    <figure className="flex flex-col gap-2">
      {phase === 'loading' ? <LoadingState label="Loading picture" /> : null}
      <img
        src={src}
        alt={media.alt}
        className={
          phase === 'loading'
            ? 'sr-only'
            : 'max-h-80 w-full rounded-surface object-contain'
        }
        onLoad={() => setPhase('ready')}
        onError={() => setPhase('error')}
      />
      {phase === 'ready' && media.credit ? (
        <figcaption className="text-sm text-muted">{media.credit}</figcaption>
      ) : null}
    </figure>
  )
}
