import { useParams, Outlet, Link, useLocation } from 'react-router'
import { SkipLink } from '@/components/layout/SkipLink.tsx'
import { Navbar } from '@/components/layout/Navbar.tsx'
import { SpaceBackground } from '@/components/layout/SpaceBackground.tsx'
import { Footer } from '@/components/layout/Footer.tsx'
import { lookupMission } from '@/missions/registry.ts'
import { NotFoundPage } from '@/pages/NotFoundPage.tsx'
import { useRouteFocus } from '@/hooks/useRouteFocus.ts'
import { ArrowLeft } from 'lucide-react'

export function MissionLayout() {
  const { missionId } = useParams()
  const location = useLocation()
  const mainRef = useRouteFocus()

  const route = missionId
    ? lookupMission(missionId)
    : { status: 'not-found' as const }

  if (route.status === 'not-found') {
    return <NotFoundPage />
  }

  const isPlay = location.pathname.endsWith('/play')

  return (
    <div className="flex min-h-svh flex-col bg-[#050a14] text-[#ffffff] selection:bg-[#d4ff9a] selection:text-[#050a14] relative">
      <SkipLink />
      <Navbar />
      <SpaceBackground showOrbits={true} />

      {/* Sub-bar for Mission Navigation */}
      <div className="pt-24 sm:pt-28 pb-4 px-4 sm:px-6 max-w-6xl mx-auto w-full flex items-center justify-between border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-[#9aa7bd] hover:text-[#d4ff9a] transition-colors"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Mission Control</span>
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#d4ff9a]">
            {route.mission.displayName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/missions/${route.mission.id}`}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !isPlay
                ? 'bg-white/[0.1] text-white'
                : 'text-[#9aa7bd] hover:text-white'
            }`}
          >
            Overview
          </Link>
          <Link
            to={`/missions/${route.mission.id}/play`}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              isPlay
                ? 'bg-[#d4ff9a] text-[#050a14] font-semibold'
                : 'text-[#9aa7bd] hover:text-white'
            }`}
          >
            Play Story
          </Link>
        </div>
      </div>

      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="flex-1 w-full max-w-6xl mx-auto py-8 px-4 sm:px-6 focus-visible:outline-none"
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
