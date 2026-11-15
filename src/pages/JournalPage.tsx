import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { BookOpen } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { listMissions } from '@/missions/registry.ts'
import type { MissionId } from '@/missions/types.ts'
import {
  PageShell,
  PersonaSwitcher,
  StatusBanner,
} from '@/pages/components/index.ts'
import { usePlatformData } from '@/pages/hooks/usePlatformData.ts'
import { JournalArchiveHero } from './components/journal/JournalArchiveHero.tsx'
import { JournalEntryCard } from './components/journal/JournalEntryCard.tsx'
import { JournalFilterZeroState } from './components/journal/JournalFilterZeroState.tsx'
import styles from './components/journal/journal.module.css'

export function JournalPage() {
  const { journalEntries, session, isLoading, error, refresh } =
    usePlatformData()
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
      visual="pioneer-10"
      title="Discovery Journal"
      description="Field observations, archived telemetry, and scientific records recovered from humanity's abandoned explorers."
      eyebrow="Archival Intelligence"
      isLoading={isLoading}
      error={error}
      onRetry={() => void refresh()}
      actions={<PersonaSwitcher />}
    >
      <div className={styles.journalContainer}>
        {isSignedOut ? (
          <StatusBanner
            variant="warning"
            title="Signed Out"
            message={
              <div className="flex flex-col gap-2">
                <p>
                  You are viewing the journal as a guest without an active
                  explorer profile. New discoveries made during missions will
                  not be saved to this browser until an explorer session is
                  established.
                </p>
                <div className="flex gap-3">
                  <Link
                    to="/auth"
                    className="font-semibold text-science hover:underline"
                  >
                    Sign in to account
                  </Link>
                  <Link
                    to="/onboarding"
                    className="font-semibold text-secondary hover:underline"
                  >
                    Continue as guest
                  </Link>
                </div>
              </div>
            }
          />
        ) : null}

        {/* Hero & Search / Filter Toolbar */}
        <JournalArchiveHero
          totalCount={journalEntries.length}
          missions={missions}
          selectedMissionId={selectedMissionId}
          onSelectMission={setSelectedMissionId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          getMissionCount={(mId: MissionId) =>
            journalEntries.filter((e) => e.missionId === mId).length
          }
        />

        {/* Empty State for Zero Total Discoveries */}
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
          <JournalFilterZeroState
            onClearFilters={() => {
              setSelectedMissionId('all')
              setSearchQuery('')
            }}
          />
        ) : null}

        {/* Entries List Feed */}
        {filteredEntries.length > 0 ? (
          <div
            className={styles.entriesFeed}
            role="feed"
            aria-label="Discovery journal entries"
          >
            {filteredEntries.map((entry) => (
              <JournalEntryCard
                key={entry.discoveryId}
                entry={entry}
                formatDate={formatUnlockedDate}
              />
            ))}
          </div>
        ) : null}
      </div>
    </PageShell>
  )
}
