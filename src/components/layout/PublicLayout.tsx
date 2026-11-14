import { Link } from 'react-router'
import { LayoutFrame } from '@/components/layout/LayoutFrame.tsx'
import { TextNav } from '@/components/layout/TextNav.tsx'
import { brandLinkClass } from '@/components/layout/layoutClasses.ts'

const publicNavItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/auth', label: 'Sign in' },
  { to: '/onboarding', label: 'Explorer setup' },
  { to: '/dashboard', label: 'Mission Control' },
] as const

export function PublicLayout() {
  return (
    <LayoutFrame
      header={
        <header className="border-b border-slate-800">
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
