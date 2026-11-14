import { useEffect, type ReactNode } from 'react'

type PlaceholderPageProps = {
  title: string
  description: string
  children?: ReactNode
}

export function PlaceholderPage({
  title,
  description,
  children,
}: PlaceholderPageProps) {
  useEffect(() => {
    document.title =
      title === 'NovaExplorer' ? title : `${title} · NovaExplorer`
  }, [title])

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium tracking-wide text-muted">
        Placeholder
      </p>
      <h1 className="text-3xl text-balance text-foreground sm:text-5xl">
        {title}
      </h1>
      <p className="max-w-[65ch] text-lg text-pretty text-secondary">
        {description}
      </p>
      {children}
    </div>
  )
}
