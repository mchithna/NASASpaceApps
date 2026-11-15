import { Calendar, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge.tsx'
import { lookupMission } from '@/missions/registry.ts'
import type { DiscoveryJournalEntry } from '@/contracts/rewards.ts'
import styles from './journal.module.css'

interface JournalEntryCardProps {
  entry: DiscoveryJournalEntry
  formatDate: (dateStr: string) => string
}

export function JournalEntryCard({ entry, formatDate }: JournalEntryCardProps) {
  const missionLookup = lookupMission(entry.missionId)
  const mission = missionLookup.status === 'found' ? missionLookup.mission : null
  const isPlaceholder = entry.contentStatus === 'placeholder'

  return (
    <article
      className={styles.entryCard}
      aria-labelledby={`entry-title-${entry.discoveryId}`}
    >
      {/* Top Metadata & Categorization */}
      <div className={styles.entryMetaTop}>
        <div className={styles.badgeGroup}>
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

        <div className={styles.entryDate}>
          <Calendar className="size-3.5" aria-hidden="true" />
          <time dateTime={entry.unlockedAt}>
            {formatDate(entry.unlockedAt)}
          </time>
        </div>
      </div>

      {/* Main Editorial Finding */}
      <div className={styles.entryMain}>
        <h3
          id={`entry-title-${entry.discoveryId}`}
          className={styles.entryTitle}
        >
          {entry.title}
        </h3>
        <p className={styles.entrySummary}>
          {entry.summary}
        </p>
      </div>

      {/* Academy Simulation Disclosure */}
      {isPlaceholder ? (
        <div className={styles.simulationBox}>
          <AlertTriangle className={styles.simulationIcon} aria-hidden="true" />
          <p>
            <strong className="font-semibold text-foreground">
              Academy Simulation Note:
            </strong>{' '}
            This entry represents a temporary training telemetry record and is not
            an official NASA scientific measurement.
          </p>
        </div>
      ) : null}

      {/* NASA Archival Sources & Documentation */}
      {mission && mission.sources && mission.sources.length > 0 ? (
        <div className={styles.sourcesSection}>
          <span className={styles.sourcesHeading}>
            Official NASA Sources & Archival Records
          </span>
          <ul
            className={styles.sourcesList}
            aria-label={`NASA sources for ${mission.displayName}`}
          >
            {mission.sources.map((source) => (
              <li key={source.id} className={styles.sourceItem}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={styles.sourceLink}
                >
                  <span>{source.title}</span>
                  <ExternalLink className="size-3 inline shrink-0" aria-hidden="true" />
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
                {source.credit ? (
                  <span className={styles.sourceCredit}>
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
}
