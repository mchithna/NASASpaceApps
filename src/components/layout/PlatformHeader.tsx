import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router'
import { MobileNav } from './MobileNav.tsx'
import type { AppNavItem } from './appNav.ts'
import { NovaLogo } from '@/pages/components/landing/NovaLogo.tsx'

export function PlatformHeader({
  items,
  label,
  actions,
  mission,
}: {
  items: readonly AppNavItem[]
  label: string
  actions?: ReactNode
  mission?: string
}) {
  return (
    <header className="platform-header">
      <div className="platform-nav">
        <Link to="/" className="platform-brand" aria-label="NovaExplorer home">
          <NovaLogo />
          <span>NovaExplorer</span>
        </Link>
        {mission ? (
          <span className="platform-mission-label">{mission}</span>
        ) : null}
        <nav aria-label={label} className="platform-desktop-nav">
          <ul>
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => (isActive ? 'is-active' : '')}
                >
                  {item.icon ? (
                    <item.icon size={16} aria-hidden="true" />
                  ) : null}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        {actions ? <div className="platform-nav-actions">{actions}</div> : null}
        <div className="platform-mobile-menu">
          <MobileNav items={items} label={label} />
        </div>
      </div>
    </header>
  )
}
