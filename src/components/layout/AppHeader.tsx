import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router'
import type { AppNavItem } from '@/components/layout/appNav.ts'
import {
  brandLinkClass,
  navLinkClass,
} from '@/components/layout/layoutClasses.ts'
import { MobileNav } from '@/components/layout/MobileNav.tsx'

type AppHeaderProps = {
  items: readonly AppNavItem[]
  label?: string
  actions?: ReactNode
}

export function AppHeader({ items, label = 'Main', actions }: AppHeaderProps) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className={brandLinkClass}>
          NovaExplorer
        </Link>
        <nav aria-label={label} className="hidden md:block">
          <ul className="flex flex-wrap gap-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => navLinkClass(isActive)}
                >
                  {item.icon ? (
                    <item.icon className="size-4" aria-hidden="true" />
                  ) : null}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          {actions}
          <MobileNav items={items} label={label} />
        </div>
        {actions ? (
          <div className="hidden items-center gap-2 md:flex">{actions}</div>
        ) : null}
      </div>
    </header>
  )
}
