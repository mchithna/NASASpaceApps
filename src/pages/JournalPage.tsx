import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { BookOpen, ExternalLink, Calendar, Search, FileText, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge.tsx'
import { Card } from '@/components/ui/Card.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { lookupMission, listMissions } from '@/missions/registry.ts'
import type { MissionId } from '@/missions/types.ts'
import {
  PageShell,
  PersonaSwitcher,
  StatusBanner,
} from '@/pages/components/index.ts'
import { usePlatformData } from '@/pages/hooks/usePlatformData.ts'

export function JournalPage() {
  const { journalEntries, session, isLoading, error, refresh } = usePlatformData()
  const [selectedMissionId, setSelectedMissionId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    document.title = 'Discovery Journal · NovaExplorer'
  }, [])

  const isSignedOut = session?.status === 'signed-out'
  const missions = listMissions()

  const formatUnlockedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  // Filter entries by mission and search query
  const filteredEntries = journalEntries.filter((entry) => {
    if (selectedMissionId !== 'all' && entry.missionId !== selectedMissionId) {
      return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const titleMatch = entry.title.toLowerCase().includes(q)
      const summaryMatch = entry.summary.toLowerCase().includes(q)
      const missionMatch = entry.missionId.toLowerCase().includes(q)
      return titleMatch || summaryMatch || missionMatch
    }
    return true
  })

  return (
    <PageShell
      title="Discovery Journal"
      description="Field observations, archived telemetry, and scientific records recovered from humanity's abandoned explorers."
      eyebrow="Archival Intelligence"
      isLoading={isLoading}
      error={error}
      onRetry={() => void refresh()}
      actions={<PersonaSwitcher />}
    >
      <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
        {isSignedOut ? (
          <StatusBanner
            variant="warning"
            title="Signed Out"
            message={
              <div className="flex flex-col gap-2">
                <p>
                  You are viewing the journal as a guest without an active explorer
                  profile. New discoveries made during missions will not be saved
                  to this browser until an explorer session is established.
                </p>
                <div className="flex gap-3">
                  <Link to="/auth" className="font-semibold text-science hover:underline">
                    Sign in to account
                  </Link>
                  <Link to="/onboarding" className="font-semibold text-secondary hover:underline">
                    Continue as guest
                  </Link>
                </div>
              </div>
            }
          />
        ) : null}

        {/* Header / Stats Summary */}
        <Card variant="elevated" className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-5 text-science" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-science">
                    Recovered Logs
                  </span>
                </div>
                <h2 className="font-heading text-2xl font-bold text-foreground">
                  Spacecraft Field Dossiers
                </h2>
                <p className="text-sm text-secondary">
                  Examine scientific telemetry and authentic NASA archival citations
                  uncovered through your historical expeditions.
                </p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted">Total Findings</span>
                  <span className="font-heading text-2xl font-bold text-foreground">
                    {journalEntries.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-border">
              {/* Mission Selector Tabs */}
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Filter discoveries by mission"
              >
                <button
                  type="button"
                  onClick={() => setSelectedMissionId('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-control border transition-colors ${
                    selectedMissionId === 'all'
                      ? 'border-science bg-science/15 text-science font-semibold'
                      : 'border-border bg-surface text-secondary hover:text-foreground'
                  }`}
                  aria-pressed={selectedMissionId === 'all'}
                >
                  All Spacecraft ({journalEntries.length})
                </button>
                {missions.map((m) => {
                  const count = journalEntries.filter(
                    (e) => e.missionId === (m.id as MissionId),
                  ).length
                  const isSelected = selectedMissionId === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMissionId(m.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-control border transition-colors ${
                        isSelected
                          ? 'border-science bg-science/15 text-science font-semibold'
                          : 'border-border bg-surface text-secondary hover:text-foreground'
                      }`}
                      aria-pressed={isSelected}
                    >
                      {m.displayName} ({count})
                    </button>
                  )
                })}
              </div>

              {/* Search box */}
              <div className="relative min-w-[220px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search findings..."
                  aria-label="Search journal findings"
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-control border border-border bg-elevated text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-science"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Empty State for Zero Discoveries */}
        {journalEntries.length === 0 && !isLoading ? (
          <EmptyState
            icon={BookOpen}
            title="No Discoveries Logged Yet"
            description="Your discovery journal is currently blank. Launch an expedition from Mission Control to analyze abandoned spacecraft and log critical mission telemetry."
            action={
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 font-semibold text-science hover:underline"
              >
                Go to Mission Control &rarr;
              </Link>
            }
          />
        ) : null}

        {/* Filter Zero State */}
        {journalEntries.length > 0 && filteredEntries.length === 0 ? (
          <div className="rounded-surface border border-border bg-surface p-8 text-center flex flex-col items-center gap-3">
            <FileText className="size-8 text-muted" aria-hidden="true" />
            <h3 className="font-heading text-lg font-semibold text-foreground">
              No matching records found
            </h3>
            <p className="text-xs text-secondary max-w-[50ch]">
              No journal logs match your current filter criteria. Reset the filter or
              try searching with different keywords.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedMissionId('all')
                setSearchQuery('')
              }}
              className="text-xs font-semibold text-science hover:underline"
            >
              Clear filters and search
            </button>
          </div>
        ) : null}

        {/* Entries List */}
        {filteredEntries.length > 0 ? (
          <div className="flex flex-col gap-6" role="feed" aria-label="Discovery journal entries">
            {filteredEntries.map((entry) => {
              const missionLookup = lookupMission(entry.missionId)
              const mission = missionLookup.status === 'found' ? missionLookup.mission : null
              const isPlaceholder = entry.contentStatus === 'placeholder'

              return (
                <article
                  key={entry.discoveryId}
                  className="rounded-surface border border-border bg-surface p-6 shadow-surface flex flex-col gap-4"
                  aria-labelledby={`entry-title-${entry.discoveryId}`}
                >
                  {/* Top metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="science">
                        {mission?.displayName ?? entry.missionId}
                      </Badge>
                      {mission?.destination ? (
                        <Badge variant="neutral">{mission.destination}</Badge>
                      ) : null}
                      {isPlaceholder ? (
                        <Badge variant="neutral">
                          <AlertTriangle className="size-3 mr-1 text-warning" aria-hidden="true" />
                          Simulation Note
                        </Badge>
                      ) : (
                        <Badge variant="success">
                          <CheckCircle2 className="size-3 mr-1" aria-hidden="true" />
                          NASA Verified Archive
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <Calendar className="size-3.5" aria-hidden="true" />
                      <time dateTime={entry.unlockedAt}>
                        {formatUnlockedDate(entry.unlockedAt)}
                      </time>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-col gap-2">
                    <h3
                      id={`entry-title-${entry.discoveryId}`}
                      className="font-heading text-xl font-bold text-foreground"
                    >
                      {entry.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-secondary">
                      {entry.summary}
                    </p>
                  </div>

                  {/* Scientific accuracy disclosure if placeholder */}
                  {isPlaceholder ? (
                    <div className="rounded-control border border-warning/30 bg-warning/5 p-3 text-xs text-secondary flex items-start gap-2.5">
                      <AlertTriangle className="size-4 shrink-0 text-warning mt-0.5" aria-hidden="true" />
                      <p>
                        <strong className="font-semibold text-foreground">Academy Simulation Note:</strong>{' '}
                        This entry represents a temporary training telemetry record and is not an
                        official NASA scientific measurement.
                      </p>
                    </div>
                  ) : null}

                  {/* NASA Archival Sources */}
                  {mission && mission.sources && mission.sources.length > 0 ? (
                    <div className="mt-2 pt-3 border-t border-border/50 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Official NASA Sources & Archival Records
                      </span>
                      <ul className="flex flex-col gap-1.5" aria-label={`NASA sources for ${mission.displayName}`}>
                        {mission.sources.map((source) => (
                          <li key={source.id} className="text-xs">
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="inline-flex items-center gap-1 font-medium text-science hover:underline"
                            >
                              <span>{source.title}</span>
                              <ExternalLink className="size-3 inline shrink-0" aria-hidden="true" />
                              <span className="sr-only"> (opens in new tab)</span>
                            </a>
                            {source.credit ? (
                              <span className="text-muted ml-2">
                                — {source.credit}
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        ) : null}
      </div>
    </PageShell>
  )
}
