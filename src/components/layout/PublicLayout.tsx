import { Link, Outlet, useLocation } from 'react-router'
import { LayoutFrame } from '@/components/layout/LayoutFrame.tsx'
import { SkipLink } from '@/components/layout/SkipLink.tsx'
import { TextNav } from '@/components/layout/TextNav.tsx'
import { brandLinkClass } from '@/components/layout/layoutClasses.ts'

const publicNavItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/auth', label: 'Sign in' },
  { to: '/onboarding', label: 'Explorer setup' },
  { to: '/dashboard', label: 'Mission Control' },
] as const

export function PublicLayout() {
  const location = useLocation()
  const isLandingPage = location.pathname === '/'

  if (isLandingPage) {
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
      header={
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Link to="/" className={brandLinkClass}>
              NovaExplorer
            </Link>
            <TextNav label="Public" items={publicNavItems} />
          </div>
        </header>
      }
    />
  )
}
