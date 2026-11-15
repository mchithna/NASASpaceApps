import { useEffect, type ReactNode } from 'react'
import { PageHeader } from '@/components/ui/PageHeader.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { PageHero } from './PageHero.tsx'
import type { SpaceVisual } from './SpaceArtwork.tsx'

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
    <div className="observatory-page flex flex-col gap-8 animate-page-rise">
      {visual ? (
        <PageHero
          title={title}
          description={description}
          eyebrow={eyebrow}
          visual={visual}
          actions={actions}
        />
      ) : (
        <header className="observatory-page-heading flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {eyebrow ? (
              <div className="eyebrow-label mb-2">
                <span className="eyebrow-dot" />
                <span>{eyebrow}</span>
              </div>
            ) : null}
            <PageHeader title={title} description={description} />
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center gap-2 pt-1">
              {actions}
            </div>
          ) : null}
        </header>
      )}

      {isLoading ? (
        <div className="py-16">
          <LoadingState label={loadingMessage} />
        </div>
      ) : error ? (
        <div className="py-16">
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
