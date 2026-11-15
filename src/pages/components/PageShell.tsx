import { useEffect, type ReactNode } from 'react'
import { PageHero } from './PageHero.tsx'
import type { SpaceVisual } from './SpaceArtwork.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { Button } from '@/components/ui/Button.tsx'

export type PageShellProps = {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
  isLoading?: boolean
  loadingMessage?: string
  error?: { message: string } | null
  onRetry?: () => void
  children?: ReactNode
  visual?: SpaceVisual
}

export function PageShell({
  title,
  description,
  eyebrow,
  actions,
  isLoading = false,
  loadingMessage = 'Loading telemetry...',
  error = null,
  onRetry,
  children,
  visual,
}: PageShellProps) {
  useEffect(() => {
    document.title =
      title === 'NovaExplorer' ? title : `${title} · NovaExplorer`
  }, [title])

  return (
    <div className="platform-page">
      <PageHero
        title={title}
        description={description}
        eyebrow={eyebrow}
        visual={visual}
      />
      {actions ? <div className="platform-page-tools">{actions}</div> : null}

      {isLoading ? (
        <div className="py-8">
          <LoadingState label={loadingMessage} />
        </div>
      ) : error ? (
        <div className="py-8">
          <ErrorState
            title="Telemetry Error"
            message={error.message}
            action={
              onRetry ? (
                <Button variant="secondary" size="small" onClick={onRetry}>
                  Retry
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        children
      )}
    </div>
  )
}
