import { FileText } from 'lucide-react'
import styles from './journal.module.css'

interface JournalFilterZeroStateProps {
  onClearFilters: () => void
}

export function JournalFilterZeroState({ onClearFilters }: JournalFilterZeroStateProps) {
  return (
    <div className={styles.filterZeroState}>
      <FileText className={styles.zeroIcon} aria-hidden="true" />
      <h3 className={styles.zeroTitle}>No matching records found</h3>
      <p className={styles.zeroDescription}>
        No journal logs match your current filter criteria. Reset the filter or
        try searching with different keywords.
      </p>
      <button
        type="button"
        onClick={onClearFilters}
        className={styles.clearButton}
      >
        Clear filters and search
      </button>
    </div>
  )
}
