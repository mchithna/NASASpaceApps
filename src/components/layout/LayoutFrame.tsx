import type { ReactNode } from 'react'
import { Outlet } from 'react-router'
import '@/styles/platform.css'
import { SkipLink } from '@/components/layout/SkipLink.tsx'
import { useRouteFocus } from '@/hooks/useRouteFocus.ts'

type LayoutFrameProps = {
  header: ReactNode
}

export function LayoutFrame({ header }: LayoutFrameProps) {
  const mainRef = useRouteFocus()

  return (
    <div className="nova-platform">
      <SkipLink />
      {header}
      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="platform-main focus-visible:outline-none"
      >
        <Outlet />
      </main>
    </div>
  )
}
