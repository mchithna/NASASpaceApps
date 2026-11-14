import { useEffect } from 'react'
import { Link } from 'react-router'
import {
  Compass,
  Search,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge.tsx'
import { Card } from '@/components/ui/Card.tsx'
import { listMissions } from '@/missions/registry.ts'
import { MissionCardPreview } from '@/pages/components/index.ts'

export function LandingPage() {
  useEffect(() => {
    document.title = 'NovaExplorer'
  }, [])

  const missions = listMissions()

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      {/* Hero Section */}
      <section
        aria-labelledby="hero-heading"
        className="relative overflow-hidden rounded-surface border border-border bg-surface p-6 shadow-surface sm:p-10 lg:p-12"
      >
        <div className="flex flex-col gap-6 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="science">NASA Space Apps Challenge 2026</Badge>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Abandoned But Not Forgotten
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <h1
              id="hero-heading"
              className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
            >
              NovaExplorer
            </h1>
            <p className="font-heading text-xl font-medium text-science sm:text-2xl">
              Discover the stories that space left behind.
            </p>
          </div>

          <p className="text-base leading-relaxed text-secondary sm:text-lg">
            Humanity has sent robotic probes, landers, and rovers into the deep
            silence of the solar system. When their primary missions concluded,
            their scientific value did not end. Investigate five inactive NASA
            spacecraft, analyze authentic mission telemetry, and uncover the
            lasting legacy they left on distant planetary worlds.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/onboarding"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-accent px-6 py-3 font-semibold text-on-bright shadow-surface transition-all hover:brightness-110 focus-visible:outline-2 focus-visible:outline-focus"
            >
              <span>Begin Exploring</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-border bg-elevated px-5 py-3 font-semibold text-foreground transition-all hover:bg-surface hover:border-science focus-visible:outline-2 focus-visible:outline-focus"
            >
              <span>Mission Control</span>
            </Link>

            <Link
              to="/auth"
              className="inline-flex min-h-11 items-center justify-center rounded-control px-4 py-3 font-medium text-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-focus"
            >
              Sign in
            </Link>
          </div>

          <div className="flex items-center gap-2 pt-2 text-xs text-muted">
            <ShieldCheck className="size-4 text-science" aria-hidden="true" />
            <span>
              Free educational experience designed for explorers ages 10–17. No
              commercial tracking or personal data collection.
            </span>
          </div>
        </div>
      </section>

      {/* Five Forgotten Explorers Section */}
      <section
        aria-labelledby="missions-heading"
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-reward" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Artifact Dossiers
            </span>
          </div>
          <h2
            id="missions-heading"
            className="font-heading text-2xl font-bold text-foreground sm:text-3xl"
          >
            The Five Forgotten Explorers
          </h2>
          <p className="max-w-[75ch] text-sm text-secondary sm:text-base">
            Each story focuses on an actual NASA spacecraft resting on the Moon,
            Mars, or outbound in the outer solar system. Select a file to inspect
            its mission destination, historical context, and flight achievements.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {missions.map((mission) => (
            <MissionCardPreview key={mission.id} mission={mission} />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section
        aria-labelledby="how-it-works-heading"
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Academy Journey
          </span>
          <h2
            id="how-it-works-heading"
            className="font-heading text-2xl font-bold text-foreground sm:text-3xl"
          >
            How NovaExplorer Works
          </h2>
          <p className="max-w-[70ch] text-sm text-secondary sm:text-base">
            Learn authentic space science through interactive investigation,
            historical reconstruction, and gamified progress.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card variant="standard" className="flex flex-col gap-3 p-5">
            <div className="flex size-10 items-center justify-center rounded-control bg-science/10 text-science">
              <Compass className="size-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                1. Choose a Story
              </h3>
              <p className="text-xs leading-relaxed text-secondary">
                Select an abandoned probe on the lunar surface, a rover across
                Martian plains, or a pioneer past the planets.
              </p>
            </div>
          </Card>

          <Card variant="standard" className="flex flex-col gap-3 p-5">
            <div className="flex size-10 items-center justify-center rounded-control bg-accent/10 text-accent">
              <Search className="size-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                2. Investigate Science
              </h3>
              <p className="text-xs leading-relaxed text-secondary">
                Explore authentic NASA telemetry, camera images, and engineering
                trade-offs that defined why each mission concluded.
              </p>
            </div>
          </Card>

          <Card variant="standard" className="flex flex-col gap-3 p-5">
            <div className="flex size-10 items-center justify-center rounded-control bg-reward/10 text-reward">
              <Award className="size-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                3. Earn Academy XP
              </h3>
              <p className="text-xs leading-relaxed text-secondary">
                Gain up to 100 XP per mission across four milestones, climbing
                six ranks from Space Cadet to Legacy Guardian.
              </p>
            </div>
          </Card>

          <Card variant="standard" className="flex flex-col gap-3 p-5">
            <div className="flex size-10 items-center justify-center rounded-control bg-success/10 text-success">
              <BookOpen className="size-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                4. Fill Your Journal
              </h3>
              <p className="text-xs leading-relaxed text-secondary">
                Catalog historical discoveries and technical insights in your
                permanent Discovery Journal.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Educational & NASA Attribution Section */}
      <section
        aria-labelledby="attribution-heading"
        className="rounded-surface border border-border bg-surface/50 p-6 sm:p-8"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="neutral">Educational Mission</Badge>
            <span className="text-xs font-medium text-muted">
              Scientific Accuracy Standard
            </span>
          </div>

          <h2
            id="attribution-heading"
            className="font-heading text-lg font-semibold text-foreground"
          >
            Scientific Integrity & NASA Sources
          </h2>

          <p className="max-w-[75ch] text-xs leading-relaxed text-secondary sm:text-sm">
            All spacecraft specifications, operational timelines, landing
            coordinates, and historical accounts are researched directly from
            NASA Science, JPL, and public NASA archives. Academy narration,
            interactive simulations, and training scenarios are educational
            interpretations designed to inspire young scientists. This project is
            an independent submission to the NASA Space Apps Challenge 2026 and is
            not officially endorsed by NASA.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
            <Link
              to="/onboarding"
              className="font-semibold text-science hover:underline"
            >
              Set up your Explorer Profile &rarr;
            </Link>
            <Link
              to="/dashboard"
              className="font-semibold text-secondary hover:underline"
            >
              Open Mission Control &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
