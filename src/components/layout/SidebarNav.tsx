import { NavLink } from 'react-router'
import type { AppNavItem } from '@/components/layout/appNav.ts'
import { navLinkClass } from '@/components/layout/layoutClasses.ts'

type SidebarNavProps = {
  items: readonly AppNavItem[]
  label?: string
}

export function SidebarNav({ items, label = 'Sections' }: SidebarNavProps) {
  return (
    <nav
      aria-label={label}
      className="w-full max-w-xs rounded-surface border border-border bg-surface p-3 shadow-surface"
    >
      <ul className="flex flex-col gap-1">
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
  )
}
