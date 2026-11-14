import { NavLink } from 'react-router'
import { navLinkClass } from '@/components/layout/layoutClasses.ts'

export type NavItem = {
  to: string
  label: string
  end?: boolean
}

type TextNavProps = {
  label: string
  items: readonly NavItem[]
}

export function TextNav({ label, items }: TextNavProps) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={`${item.to}-${item.label}`}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
