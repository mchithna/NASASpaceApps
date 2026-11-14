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
      <p className="text-sm font-medium tracking-wide text-slate-300">
        Placeholder
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-balance text-slate-100 sm:text-5xl">
        {title}
      </h1>
      <p className="max-w-2xl text-lg text-pretty text-slate-200">
        {description}
      </p>
      {children}
    </div>
  )
}
