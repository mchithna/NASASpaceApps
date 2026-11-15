import { Outlet, useLocation } from 'react-router'
import { LayoutFrame } from '@/components/layout/LayoutFrame.tsx'
import { SkipLink } from '@/components/layout/SkipLink.tsx'
import { PlatformHeader } from '@/components/layout/PlatformHeader.tsx'

const publicNavItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/auth', label: 'Sign in' },
  { to: '/onboarding', label: 'Explorer setup' },
  { to: '/dashboard', label: 'Mission Control' },
] as const

export function PublicLayout() {
  const location = useLocation()
  const isFullWidthPage =
    location.pathname === '/' || location.pathname === '/auth'

  if (isFullWidthPage) {
    return (
      <div className="min-h-svh bg-landing-bg text-landing-text selection:bg-landing-lime selection:text-landing-bg">
        <SkipLink />
        <main
          id="main-content"
          tabIndex={-1}
          className="focus-visible:outline-none"
        >
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <LayoutFrame
      header={<PlatformHeader items={publicNavItems} label="Public" />}
    />
  )
}
