import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ArrowUpRight, Menu, X, LogOut } from 'lucide-react'
import { NovaLogo } from '@/pages/components/landing/NovaLogo.tsx'
import { useNovaServices } from '@/pages/context/index.ts'
import type { AuthSession } from '@/contracts/auth.ts'

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { services } = useNovaServices()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [session, setSession] = useState<AuthSession | null>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

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

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('keydown', onKey)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const isSessionActive =
    session?.status === 'authenticated' || session?.status === 'guest'

  const handleSignOut = async () => {
    await services.auth.signOut()
    setOpen(false)
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Mission Control' },
    { to: '/journal', label: 'Journal' },
    { to: '/achievements', label: 'Achievements' },
  ]

  const isLinkActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header
      className={`fixed top-4 sm:top-5 inset-x-0 z-50 px-4 sm:px-6 transition-all duration-300 pointer-events-none ${
        scrolled ? 'translate-y-[-2px]' : ''
      }`}
    >
      <nav
        aria-label="Main Navigation"
        className="pointer-events-auto max-w-6xl mx-auto flex items-center justify-between gap-4 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border border-white/[0.12] bg-[#0b1421]/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.5)] transition-all duration-200"
      >
        {/* Brand Logo & Name */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-white font-heading font-semibold text-lg sm:text-xl tracking-tight shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ff9a] rounded-full px-1"
          aria-label="NovaExplorer Home"
        >
          <NovaLogo size={28} />
          <span>
            Nova<span className="text-[#53cbff]">Explorer</span>
          </span>
        </Link>

        {/* Center Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ to, label }) => {
            const active = isLinkActive(to)
            return (
              <Link
                key={to}
                to={to}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  active
                    ? 'text-white bg-white/[0.08] shadow-[inset_0_-1px_#d4ff9a]'
                    : 'text-[#9aa7bd] hover:text-white hover:bg-white/[0.04]'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Right Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {isSessionActive ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  isLinkActive('/profile')
                    ? 'text-white bg-white/[0.08]'
                    : 'text-[#9aa7bd] hover:text-white'
                }`}
              >
                Explorer Profile
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#9aa7bd] border border-white/10 hover:border-[#d4ff9a]/40 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
                aria-label={
                  session?.status === 'guest'
                    ? 'End guest session'
                    : 'Sign out of academy'
                }
              >
                <LogOut size={13} aria-hidden="true" />
                <span>
                  {session?.status === 'guest' ? 'End Session' : 'Sign Out'}
                </span>
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-xs font-medium text-[#9aa7bd] hover:text-white px-3 py-1.5 rounded-full transition-colors"
              >
                Login / Sign Up
              </Link>
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-[#050a14] bg-[#d4ff9a] border border-[#eaffc7] shadow-[0_0_18px_rgba(212,255,154,0.3)] hover:bg-[#e4ffb8] hover:shadow-[0_0_26px_rgba(212,255,154,0.5)] transition-all duration-200"
              >
                <span>Start Exploring</span>
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen(!open)}
          className="flex lg:hidden items-center justify-center size-9 rounded-full border border-white/15 bg-white/[0.04] text-[#9aa7bd] hover:text-white hover:border-[#d4ff9a] transition-colors"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
        >
          {open ? (
            <X size={18} aria-hidden="true" />
          ) : (
            <Menu size={18} aria-hidden="true" />
          )}
        </button>

        {/* Mobile Navigation Dropdown Drawer */}
        {open && (
          <div className="absolute top-[calc(100%+8px)] inset-x-4 lg:hidden flex flex-col gap-2 p-4 rounded-2xl border border-white/15 bg-[#0b1421]/95 backdrop-blur-2xl shadow-2xl animate-page-rise">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isLinkActive(to)
                    ? 'text-[#d4ff9a] bg-white/[0.08]'
                    : 'text-[#9aa7bd] hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}

            <div className="border-t border-white/10 my-1" />

            {isSessionActive ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 text-sm text-[#9aa7bd] hover:text-white"
                >
                  Explorer Profile
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#f87171] text-left"
                >
                  <LogOut size={15} aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 text-sm text-[#9aa7bd] hover:text-white"
                >
                  Login / Sign Up
                </Link>
                <Link
                  to="/onboarding"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold text-[#050a14] bg-[#d4ff9a] shadow-[0_0_16px_rgba(212,255,154,0.3)] mt-1"
                >
                  <span>Start Exploring</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
