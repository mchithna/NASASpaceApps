import { Outlet } from 'react-router'
import { SkipLink } from '@/components/layout/SkipLink.tsx'
import { Navbar } from '@/components/layout/Navbar.tsx'
import { SpaceBackground } from '@/components/layout/SpaceBackground.tsx'
import { Footer } from '@/components/layout/Footer.tsx'
import { useRouteFocus } from '@/hooks/useRouteFocus.ts'

export function AppLayout() {
  const mainRef = useRouteFocus()

  return (
    <div className="nova-inner flex min-h-svh flex-col bg-[#050a14] text-[#ffffff] selection:bg-[#d4ff9a] selection:text-[#050a14] relative">
      <SkipLink />
      <Navbar />
      <SpaceBackground showOrbits={true} />
      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="flex-1 w-full max-w-6xl mx-auto pt-24 sm:pt-28 pb-16 px-4 sm:px-6 focus-visible:outline-none"
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
