import { Link } from 'react-router'
import { PlaceholderPage } from '@/components/layout/PlaceholderPage.tsx'
import { textLinkClass } from '@/components/layout/layoutClasses.ts'
import { missions } from '@/lib/missions.ts'

export function DashboardPage() {
  return (
    <PlaceholderPage
      title="Mission Control"
      description="This page will become the home base for choosing a story and coming back to it later. Progress tracking is not available yet."
    >
      <section className="flex flex-col gap-3">
        <h2 className="text-xl text-foreground">Stories</h2>
        <p className="max-w-[65ch] text-secondary">
          Each link opens a placeholder. The chapters are not written yet.
        </p>
        <ul className="flex flex-col gap-2">
          {missions.map((mission) => (
            <li key={mission.id}>
              <Link className={textLinkClass} to={`/missions/${mission.id}`}>
                {mission.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PlaceholderPage>
  )
}
