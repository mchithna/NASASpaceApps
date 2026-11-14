import { Link } from 'react-router'
import { PlaceholderPage } from '@/components/layout/PlaceholderPage.tsx'
import { textLinkClass } from '@/components/layout/layoutClasses.ts'

export function LandingPage() {
  return (
    <PlaceholderPage
      title="NovaExplorer"
      description="Discover the stories that space left behind. This page will welcome explorers and point them toward five spacecraft stories. NASA Space Apps Challenge 2026."
    >
      <ul className="flex flex-col gap-2">
        <li>
          <Link className={textLinkClass} to="/auth">
            Sign in
          </Link>
        </li>
        <li>
          <Link className={textLinkClass} to="/onboarding">
            Explorer setup
          </Link>
        </li>
        <li>
          <Link className={textLinkClass} to="/dashboard">
            Mission Control
          </Link>
        </li>
      </ul>
    </PlaceholderPage>
  )
}
