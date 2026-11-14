import type { ReactNode } from 'react'
import { Outlet } from 'react-router'
import { mainClassName } from '@/components/layout/layoutClasses.ts'
import { SkipLink } from '@/components/layout/SkipLink.tsx'
import { useRouteFocus } from '@/hooks/useRouteFocus.ts'

type LayoutFrameProps = {
  header: ReactNode
}

export function LayoutFrame({ header }: LayoutFrameProps) {
  const mainRef = useRouteFocus()

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <SkipLink />
      {header}
      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className={mainClassName}
      >
        <Outlet />
      </main>
    </div>
  )
}
