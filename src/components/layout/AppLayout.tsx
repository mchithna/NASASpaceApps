import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { LogOut } from 'lucide-react'
import type { AuthSession } from '@/contracts/auth.ts'
import { LayoutFrame } from '@/components/layout/LayoutFrame.tsx'
import { TextNav } from '@/components/layout/TextNav.tsx'
import { brandLinkClass } from '@/components/layout/layoutClasses.ts'
import { useNovaServices } from '@/pages/context/index.ts'

const explorerNavItems = [
  { to: '/dashboard', label: 'Mission Control' },
  { to: '/profile', label: 'Profile' },
  { to: '/journal', label: 'Journal' },
  { to: '/achievements', label: 'Achievements' },
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
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Link to="/" className={brandLinkClass}>
              NovaExplorer
            </Link>
            <div className="flex flex-wrap items-center gap-4">
              <TextNav label="Explorer" items={explorerNavItems} />
              {isSessionActive ? (
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
              ) : null}
            </div>
          </div>
        </header>
      }
    />
  )
}
