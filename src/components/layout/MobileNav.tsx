import { useState } from 'react'
import { Menu } from 'lucide-react'
import { NavLink } from 'react-router'
import type { AppNavItem } from '@/components/layout/appNav.ts'
import { navLinkClass } from '@/components/layout/layoutClasses.ts'
import { Button } from '@/components/ui/Button.tsx'
import { Dialog } from '@/components/ui/Dialog.tsx'

type MobileNavProps = {
  items: readonly AppNavItem[]
  label?: string
}

export function MobileNav({ items, label = 'Mobile' }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="secondary"
        size="small"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu className="size-4" aria-hidden="true" />
        Menu
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Menu"
        description="Choose a page."
      >
        <nav aria-label={label}>
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => navLinkClass(isActive)}
                  onClick={() => setOpen(false)}
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
      </Dialog>
    </>
  )
}
