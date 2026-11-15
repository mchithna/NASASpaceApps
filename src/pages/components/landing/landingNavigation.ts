import type { MouseEvent } from 'react'

export function scrollToLandingSection(event: MouseEvent<HTMLAnchorElement>) {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  const id = event.currentTarget.hash.slice(1)
  const target = document.getElementById(id)
  if (!target) return
  event.preventDefault()
  if (target instanceof HTMLDetailsElement) target.open = true
  const reduced = window.matchMedia?.(
    '(prefers-reduced-motion: reduce)',
  ).matches
  target.scrollIntoView?.({
    behavior: reduced ? 'instant' : 'smooth',
    block: 'start',
  })
  window.history.replaceState(null, '', `#${id}`)
  target.focus({ preventScroll: true })
}
