import { Search, BookOpen } from 'lucide-react'
import type { MissionId, MissionDefinition } from '@/missions/types.ts'
import styles from './journal.module.css'

interface JournalArchiveHeroProps {
  totalCount: number
  missions: readonly MissionDefinition[]
  selectedMissionId: string
  onSelectMission: (missionId: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  getMissionCount: (missionId: MissionId) => number
}

export function JournalArchiveHero({
  totalCount,
  missions,
  selectedMissionId,
  onSelectMission,
  searchQuery,
  onSearchChange,
  getMissionCount,
}: JournalArchiveHeroProps) {
  return (
    <div className={styles.archiveHero}>
      <div className={styles.heroCosmos} aria-hidden="true" />
      <div className={styles.heroHeader}>
        <div className={styles.heroTopRow}>
          <div className={styles.heroIdentity}>
            <div className={styles.eyebrow}>
              <span className={styles.statusDot} aria-hidden="true" />
              <span>Recovered Logs</span>
            </div>
            <h2 className={styles.heroTitle}>Spacecraft Field Dossiers</h2>
            <p className={styles.heroDescription}>
              Examine scientific telemetry and authentic NASA archival citations
              uncovered through your historical expeditions.
            </p>
          </div>

          <div className={styles.statBadge}>
            <span className={styles.statLabel}>Total Findings</span>
            <span className={styles.statValue}>{totalCount}</span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className={styles.toolbar}>
          <div
            className={styles.filterGroup}
            role="group"
            aria-label="Filter discoveries by mission"
          >
            <button
              type="button"
              onClick={() => onSelectMission('all')}
              className={`${styles.filterButton} ${
                selectedMissionId === 'all' ? styles.filterButtonActive : ''
              }`}
              aria-pressed={selectedMissionId === 'all'}
            >
              <BookOpen className="size-3.5" aria-hidden="true" />
              All Spacecraft ({totalCount})
            </button>
            {missions.map((m) => {
              const count = getMissionCount(m.id)
              const isSelected = selectedMissionId === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMission(m.id)}
                  className={`${styles.filterButton} ${
                    isSelected ? styles.filterButtonActive : ''
                  }`}
                  aria-pressed={isSelected}
                >
                  {m.displayName} ({count})
                </button>
              )
            })}
          </div>

          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search findings..."
              aria-label="Search journal findings"
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
