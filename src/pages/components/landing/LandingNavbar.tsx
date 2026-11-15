import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Menu, X, Compass, UserCheck } from 'lucide-react'
import { NovaLogo } from './NovaLogo.tsx'

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<'home' | 'missions' | 'how-it-works' | 'about'>('home')
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24)

      const missionsEl = document.getElementById('featured-missions')
      const howItWorksEl = document.getElementById('how-it-works')
      const aboutEl = document.getElementById('about')

      const scrollPos = window.scrollY + 200

      if (aboutEl && scrollPos >= aboutEl.offsetTop) {
        setActiveSection('about')
      } else if (howItWorksEl && scrollPos >= howItWorksEl.offsetTop) {
        setActiveSection('how-it-works')
      } else if (missionsEl && scrollPos >= missionsEl.offsetTop) {
        setActiveSection('missions')
      } else {
        setActiveSection('home')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  const scrollTo = (id: string, section: 'home' | 'missions' | 'how-it-works' | 'about') => {
    setMobileMenuOpen(false)
    setActiveSection(section)
    if (id === 'top') {
      if (typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }
    const el = document.getElementById(id)
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }


  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-3 pt-3 sm:px-6 sm:pt-4 transition-all duration-300">
      <nav
        aria-label="Main Navigation"
        className={`w-full max-w-6xl rounded-full border transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0B1421]/95 backdrop-blur-md border-[#344354] shadow-elevated py-2.5 px-4 sm:px-6'
            : 'bg-[#0B1421]/80 backdrop-blur-md border-[#344354]/80 shadow-surface py-3 px-4 sm:px-6'
        } flex items-center justify-between`}
      >
        {/* Left Side: Brand Logo, Wordmark, and Separator */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault()
              scrollTo('top', 'home')
            }}
            className="flex items-center gap-2.5 rounded-full text-left transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[#53CBFF]"
            aria-label="NovaExplorer Home"
          >
            <NovaLogo size={30} className="size-7 sm:size-8" />
            <h1 className="m-0 p-0 font-heading text-lg sm:text-xl font-bold tracking-tight text-[#F5F7FB]">
              Nova<span className="text-[#53CBFF]">Explorer</span>
            </h1>
          </Link>

          {/* Thin Vertical Separator */}
          <span className="hidden sm:inline-block h-4 w-px bg-[#344354]" aria-hidden="true" />

          {/* Mission Control Quick Pill */}
          <Link
            to="/dashboard"
            aria-label="Mission Control Telemetry Status"
            className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-[#344354]/60 bg-[#152333]/60 px-2.5 py-0.5 text-xs font-medium text-[#AAB7C8] hover:border-[#53CBFF]/60 hover:text-[#53CBFF] transition-colors focus-visible:outline-2 focus-visible:outline-[#53CBFF]"
          >
            <span className="size-1.5 rounded-full bg-[#4FD1A5] animate-pulse" />
            <span>Mission Control</span>
          </Link>

        </div>

        {/* Center Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-1 rounded-full border border-[#344354]/60 bg-[#152333]/40 p-1">
          <button
            type="button"
            onClick={() => scrollTo('top', 'home')}
            className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              activeSection === 'home'
                ? 'bg-[#152333] text-[#F5F7FB] shadow-sm'
                : 'text-[#AAB7C8] hover:text-[#F5F7FB]'
            } focus-visible:outline-2 focus-visible:outline-[#53CBFF]`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => scrollTo('featured-missions', 'missions')}
            className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              activeSection === 'missions'
                ? 'bg-[#152333] text-[#F5F7FB] shadow-sm'
                : 'text-[#AAB7C8] hover:text-[#F5F7FB]'
            } focus-visible:outline-2 focus-visible:outline-[#53CBFF]`}
          >
            Explore Missions
          </button>
          <button
            type="button"
            onClick={() => scrollTo('how-it-works', 'how-it-works')}
            className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              activeSection === 'how-it-works'
                ? 'bg-[#152333] text-[#F5F7FB] shadow-sm'
                : 'text-[#AAB7C8] hover:text-[#F5F7FB]'
            } focus-visible:outline-2 focus-visible:outline-[#53CBFF]`}
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => scrollTo('about', 'about')}
            className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              activeSection === 'about'
                ? 'bg-[#152333] text-[#F5F7FB] shadow-sm'
                : 'text-[#AAB7C8] hover:text-[#F5F7FB]'
            } focus-visible:outline-2 focus-visible:outline-[#53CBFF]`}
          >
            About
          </button>
        </div>

        {/* Right Side: Auth Links & Start Exploring CTA (Desktop) */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          <Link
            to="/auth"
            className="rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium text-[#AAB7C8] hover:text-[#F5F7FB] transition-colors focus-visible:outline-2 focus-visible:outline-[#53CBFF]"
          >
            Login
          </Link>
          <Link
            to="/auth"
            className="hidden lg:inline-flex rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium text-[#AAB7C8] hover:text-[#F5F7FB] transition-colors focus-visible:outline-2 focus-visible:outline-[#53CBFF]"
          >
            Sign Up
          </Link>
          <Link
            to="/onboarding"
            className="group relative inline-flex items-center justify-center gap-1.5 rounded-full bg-[#D9FCA7] px-4 py-2 text-xs sm:text-sm font-semibold text-[#050A12] shadow-sm transition-all hover:bg-[#c9f690] hover:shadow-[0_0_20px_rgba(217,252,167,0.4)] focus-visible:outline-2 focus-visible:outline-[#D9FCA7]"
          >
            <span>Start Exploring</span>
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        {/* Mobile Hamburger Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-1 rounded-full bg-[#D9FCA7] px-3 py-1.5 text-xs font-semibold text-[#050A12]"
          >
            <span>Explore</span>
            <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="inline-flex size-9 items-center justify-center rounded-full border border-[#344354] bg-[#152333] text-[#F5F7FB] transition-colors hover:bg-[#101C2A] focus-visible:outline-2 focus-visible:outline-[#53CBFF]"
          >
            {mobileMenuOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile Animated Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-x-3 top-18 rounded-3xl border border-[#344354] bg-[#0B1421]/98 backdrop-blur-xl p-5 shadow-elevated flex flex-col gap-4 sm:hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="flex flex-col gap-1 border-b border-[#344354]/60 pb-3">
            <button
              type="button"
              onClick={() => scrollTo('top', 'home')}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[#F5F7FB] hover:bg-[#152333]"
            >
              <span>Home</span>
              <Compass className="size-4 text-[#53CBFF]" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollTo('featured-missions', 'missions')}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[#F5F7FB] hover:bg-[#152333]"
            >
              <span>Explore Missions</span>
              <span className="text-xs text-[#D9FCA7]">5 Stories</span>
            </button>
            <button
              type="button"
              onClick={() => scrollTo('how-it-works', 'how-it-works')}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[#F5F7FB] hover:bg-[#152333]"
            >
              <span>How It Works</span>
              <span className="text-xs text-[#53CBFF]">Academy</span>
            </button>
            <button
              type="button"
              onClick={() => scrollTo('about', 'about')}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[#F5F7FB] hover:bg-[#152333]"
            >
              <span>About &amp; NASA Sources</span>
            </button>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[#4FD1A5] hover:bg-[#152333]"
            >
              <span>Mission Control</span>
              <span className="size-2 rounded-full bg-[#4FD1A5] animate-pulse" />
            </Link>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl border border-[#344354] bg-[#152333] py-2.5 text-xs font-medium text-[#F5F7FB] hover:bg-[#101C2A]"
              >
                Login
              </Link>
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl border border-[#344354] bg-[#152333] py-2.5 text-xs font-medium text-[#F5F7FB] hover:bg-[#101C2A]"
              >
                Sign Up
              </Link>
            </div>
            <Link
              to="/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#D9FCA7] py-3 text-sm font-semibold text-[#050A12] shadow-sm hover:bg-[#c9f690]"
            >
              <UserCheck className="size-4" aria-hidden="true" />
              <span>Start Exploring</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
