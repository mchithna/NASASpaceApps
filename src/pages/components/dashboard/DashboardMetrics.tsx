import styles from '@/pages/components/dashboard/dashboard.module.css'

export type DashboardMetric = {
  label: string
  value: string
  detail: string
}

export function DashboardMetrics({ metrics }: { metrics: readonly DashboardMetric[] }) {
  return (
    <ul className={styles.metrics}>
      {metrics.map((metric) => (
        <li key={metric.label} className={styles.metric}>
          <p className={styles.metricLabel}>{metric.label}</p>
          <p className={styles.metricValue}>{metric.value}</p>
          <p className={styles.metricDetail}>{metric.detail}</p>
        </li>
      ))}
    </ul>
  )
}
