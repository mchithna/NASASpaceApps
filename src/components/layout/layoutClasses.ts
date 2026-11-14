import { focusRing } from '@/components/ui/focusRing.ts'

export const mainClassName = `mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 ${focusRing}`

export const textLinkClass = `inline-flex min-h-11 items-center rounded-sm text-foreground underline decoration-2 underline-offset-4 ${focusRing}`

export const brandLinkClass = `inline-flex min-h-11 items-center rounded-sm font-heading text-lg font-semibold text-foreground ${focusRing}`

const navLinkClassName = `inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-medium text-secondary hover:bg-elevated hover:text-foreground ${focusRing}`

const activeNavLinkClassName = `inline-flex min-h-11 items-center gap-2 rounded-control bg-elevated px-3 text-sm font-medium text-foreground underline decoration-2 underline-offset-4 ${focusRing}`

export function navLinkClass(isActive: boolean): string {
  return isActive ? activeNavLinkClassName : navLinkClassName
}
