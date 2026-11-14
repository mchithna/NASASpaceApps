export const mainClassName =
  'mx-auto w-full max-w-5xl flex-1 px-4 py-10 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-slate-100 sm:px-6'

export const textLinkClass =
  'inline-flex min-h-11 items-center rounded-sm text-slate-100 underline decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-slate-100'

export const brandLinkClass =
  'inline-flex min-h-11 items-center rounded-sm text-lg font-semibold tracking-tight text-slate-100 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-slate-100'

const navLinkClassName =
  'inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-slate-200 hover:bg-slate-900 hover:text-white focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-slate-100'

const activeNavLinkClassName =
  'inline-flex min-h-11 items-center rounded-md bg-slate-800 px-3 text-sm font-medium text-white underline decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-slate-100'

export function navLinkClass(isActive: boolean): string {
  return isActive ? activeNavLinkClassName : navLinkClassName
}
