import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { NovaLogo } from './NovaLogo.tsx'
import { scrollToLandingSection } from './landingNavigation.ts'

const links = [
  { id: 'home', label: 'Home' },
  { id: 'featured-missions', label: 'Explore Missions' },
  { id: 'about', label: 'About' },
]

export function LandingNavbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('home')
  const toggle = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)
      setActive(
        [...links].reverse().find(({ id }) => {
          const section = document.getElementById(id)
          return section && section.getBoundingClientRect().top <= 180
        })?.id ?? 'home',
      )
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        if (
          document
            .getElementById('landing-menu')
            ?.contains(document.activeElement)
        )
          toggle.current?.focus()
      }
    }
    const desktop = window.matchMedia?.('(min-width: 1100px)')
    const close = () => setOpen(false)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('keydown', onKey)
    desktop?.addEventListener('change', close)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKey)
      desktop?.removeEventListener('change', close)
    }
  }, [])
  const sectionLinks = links.map(({ id, label }) => (
    <a
      key={id}
      href={`#${id}`}
      aria-current={active === id ? 'location' : undefined}
      onClick={(event) => {
        scrollToLandingSection(event)
        setOpen(false)
        setActive(id)
      }}
    >
      {label}
    </a>
  ))
  return (
    <header className={`lp-header ${scrolled ? 'lp-header-scrolled' : ''}`}>
      <nav aria-label="Main Navigation" className="lp-nav">
        <a
          href="#home"
          className="lp-brand"
          aria-label="NovaExplorer Home"
          onClick={scrollToLandingSection}
        >
          <NovaLogo />
          <span>NovaExplorer</span>
        </a>
        <span className="lp-nav-divider" aria-hidden="true" />
        <div className="lp-desktop-links">{sectionLinks}</div>
        <div className="lp-desktop-actions">
          <Link to="/auth">Login</Link>
          <Link to="/auth">Sign Up</Link>
          <Link className="lp-button lp-primary" to="/onboarding">
            Start Exploring <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <button
          ref={toggle}
          type="button"
          className="lp-menu-toggle"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-controls="landing-menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        {open && (
          <div id="landing-menu" className="lp-mobile-menu">
            {sectionLinks}
            <Link to="/auth" onClick={() => setOpen(false)}>
              Login
            </Link>
            <Link to="/auth" onClick={() => setOpen(false)}>
              Sign Up
            </Link>
            <Link
              className="lp-button lp-primary"
              to="/onboarding"
              onClick={() => setOpen(false)}
            >
              Start Exploring <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
