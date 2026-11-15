import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { LogOut, Orbit, UserRound, BookOpen, Award } from 'lucide-react'
import type { AuthSession } from '@/contracts/auth.ts'
import { LayoutFrame } from '@/components/layout/LayoutFrame.tsx'
import { PlatformHeader } from '@/components/layout/PlatformHeader.tsx'
import { useNovaServices } from '@/pages/context/index.ts'

const explorerNavItems = [
  { to: '/dashboard', label: 'Mission Control', icon: Orbit },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/journal', label: 'Journal', icon: BookOpen },
  { to: '/achievements', label: 'Achievements', icon: Award },
] as const

export function AppLayout() {
  const { services } = useNovaServices()
  const navigate = useNavigate()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    let ignore = false
    void services.auth.getSession().then((res) => {
      if (!ignore && res.ok) {
        setSession(res.data)
      }
    })

    const unsubscribe = services.auth.subscribe((next) => {
      if (!ignore) {
        setSession(next)
      }
    })

    return () => {
      ignore = true
      unsubscribe()
    }
  }, [services])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await services.auth.signOut()
      navigate('/')
    } finally {
      setIsSigningOut(false)
    }
  }

  const isSessionActive =
    session?.status === 'authenticated' || session?.status === 'guest'

  return (
    <LayoutFrame
      header={
        <PlatformHeader
          items={explorerNavItems}
          label="Explorer"
          actions={
            isSessionActive ? (
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-control border border-border bg-elevated px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50"
                aria-label={
                  session?.status === 'guest'
                    ? 'End guest session'
                    : 'Sign out of academy'
                }
              >
                <LogOut className="size-3.5" aria-hidden="true" />
                <span>
                  {session?.status === 'guest' ? 'End Session' : 'Sign Out'}
                </span>
              </button>
            ) : null
          }
        />
      }
    />
  )
}
