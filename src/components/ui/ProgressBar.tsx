import { useId } from 'react'

type ProgressBarProps = {
  value: number
  max?: number
  label?: string
  valueLabel?: string
}

export function ProgressBar({
  value,
  max = 100,
  label,
  valueLabel,
}: ProgressBarProps) {
  const labelId = useId()
  const safeMax = max > 0 ? max : 100
  const clamped = Math.min(
    safeMax,
    Math.max(0, Number.isFinite(value) ? value : 0),
  )
  const percent = (clamped / safeMax) * 100

  return (
    <div className="flex flex-col gap-2">
      {label || valueLabel ? (
        <div className="flex items-baseline justify-between gap-4 text-sm">
          <span id={labelId} className={label ? 'text-foreground' : 'sr-only'}>
            {label ?? 'Progress'}
          </span>
          {valueLabel ? (
            <span className="font-medium text-secondary tabular-nums">
              {valueLabel}
            </span>
          ) : null}
        </div>
      ) : (
        <span id={labelId} className="sr-only">
          Progress
        </span>
      )}
      <div
        className="h-2 overflow-hidden rounded-full bg-elevated"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={clamped}
        aria-labelledby={labelId}
      >
        <div
          className="h-full rounded-full bg-accent motion-safe:transition-[width] motion-safe:duration-150"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
