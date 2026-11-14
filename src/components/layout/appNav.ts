import type { LucideIcon } from 'lucide-react'

export type AppNavItem = {
  to: string
  label: string
  end?: boolean
  icon?: LucideIcon
}
