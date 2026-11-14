import { Link } from 'react-router'
import { LayoutFrame } from '@/components/layout/LayoutFrame.tsx'
import { TextNav } from '@/components/layout/TextNav.tsx'
import { brandLinkClass } from '@/components/layout/layoutClasses.ts'

const explorerNavItems = [
  { to: '/dashboard', label: 'Mission Control' },
  { to: '/profile', label: 'Profile' },
  { to: '/journal', label: 'Journal' },
  { to: '/achievements', label: 'Achievements' },
] as const

export function AppLayout() {
  return (
    <LayoutFrame
      header={
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:px-6">
            <Link to="/" className={brandLinkClass}>
              NovaExplorer
            </Link>
            <TextNav label="Explorer" items={explorerNavItems} />
          </div>
        </header>
      }
    />
  )
}
