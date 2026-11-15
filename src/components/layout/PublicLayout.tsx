import { Outlet, useLocation } from 'react-router'
import { SkipLink } from '@/components/layout/SkipLink.tsx'
import { Navbar } from '@/components/layout/Navbar.tsx'
import { SpaceBackground } from '@/components/layout/SpaceBackground.tsx'
import { Footer } from '@/components/layout/Footer.tsx'

export function PublicLayout() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  if (isLanding) {
    return (
      <div className="min-h-svh bg-[#050a14] text-[#ffffff] selection:bg-[#d4ff9a] selection:text-[#050a14]">
        <SkipLink />
        <main
          id="main-content"
          tabIndex={-1}
          className="focus-visible:outline-none"
        >
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-[#050a14] text-[#ffffff] selection:bg-[#d4ff9a] selection:text-[#050a14] relative">
      <SkipLink />
      <Navbar />
      <SpaceBackground />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 w-full max-w-6xl mx-auto pt-24 sm:pt-28 pb-16 px-4 sm:px-6 focus-visible:outline-none"
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
