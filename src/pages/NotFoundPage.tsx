import { SpaceBackground } from '@/components/layout/SpaceBackground.tsx'
import { Footer } from '@/components/layout/Footer.tsx'
import { Link } from 'react-router'
import { ArrowLeft, Orbit } from 'lucide-react'
import { useRouteFocus } from '@/hooks/useRouteFocus.ts'
import { SpaceArtwork } from './components/SpaceArtwork.tsx'
import '@/styles/platform.css'

export function NotFoundPage() {
  const mainRef = useRouteFocus()
  return (
    <div className="nova-platform nova-inner">
      <SpaceBackground />
      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="platform-main platform-not-found focus-visible:outline-none"
      >
        <SpaceArtwork visual="mars" />
        <div className="flex flex-col items-center gap-5">
          <p className="platform-eyebrow">
            <Orbit size={15} aria-hidden="true" />
            404 / Outside the flight path
          </p>
          <h1>Page not found</h1>
          <p>
            This address is not part of NovaExplorer yet. There are still plenty
            of stories waiting to be discovered.
          </p>
          <Link className="platform-action" to="/">
            <ArrowLeft size={17} aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
