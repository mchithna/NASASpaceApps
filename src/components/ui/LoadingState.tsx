import { LoaderCircle } from 'lucide-react'

type LoadingStateProps = {
  label?: string
}

export function LoadingState({ label = 'Loading' }: LoadingStateProps) {
  return (
    <div role="status" className="flex items-center gap-3 text-secondary">
      <LoaderCircle
        className="size-5 motion-safe:animate-spin"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  )
}

type LoadingSkeletonProps = {
  label?: string
}

export function LoadingSkeleton({
  label = 'Loading content',
}: LoadingSkeletonProps) {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-3">
      <span className="sr-only">{label}</span>
      <span className="h-4 w-1/3 rounded-control bg-elevated motion-safe:animate-pulse" />
      <span className="h-4 w-full rounded-control bg-elevated motion-safe:animate-pulse" />
      <span className="h-4 w-4/5 rounded-control bg-elevated motion-safe:animate-pulse" />
    </div>
  )
}
