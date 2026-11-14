import { Link } from 'react-router'
import {
  mainClassName,
  textLinkClass,
} from '@/components/layout/layoutClasses.ts'
import { PlaceholderPage } from '@/components/layout/PlaceholderPage.tsx'
import { useRouteFocus } from '@/hooks/useRouteFocus.ts'

export function NotFoundPage() {
  const mainRef = useRouteFocus()

  return (
    <div className="flex min-h-svh flex-col bg-slate-950 text-slate-100">
      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className={mainClassName}
      >
        <PlaceholderPage
          title="Page not found"
          description="This address is not part of NovaExplorer yet."
        >
          <Link className={textLinkClass} to="/">
            Back to home
          </Link>
        </PlaceholderPage>
      </main>
    </div>
  )
}
