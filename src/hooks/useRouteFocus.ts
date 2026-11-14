import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

let lastFocusedPath: string | null = null

export function useRouteFocus() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (lastFocusedPath === pathname) {
      return
    }

    const shouldMoveFocus = lastFocusedPath !== null
    lastFocusedPath = pathname

    if (shouldMoveFocus) {
      mainRef.current?.focus()
    }
  }, [pathname])

  return mainRef
}
