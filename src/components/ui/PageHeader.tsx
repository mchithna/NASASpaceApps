import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  // Split title for two-tone style if there are multiple words
  const words = title.split(' ')
  const isTwoTone = words.length > 1
  const firstPart = isTwoTone ? words.slice(0, -1).join(' ') : title
  const highlightWord = isTwoTone ? words[words.length - 1] : ''

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-[65ch] flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold text-balance text-white sm:text-5xl tracking-tight">
          {isTwoTone ? (
            <>
              <span>{firstPart}</span>{' '}
              <span className="text-[#d4ff9a]">{highlightWord}</span>
            </>
          ) : (
            title
          )}
        </h1>
        {description ? (
          <p className="text-sm sm:text-base text-pretty text-[#9aa7bd] leading-relaxed max-w-2xl">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  )
}
