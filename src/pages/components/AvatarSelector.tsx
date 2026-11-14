import { Badge } from '@/components/ui/Badge.tsx'
import type { AvatarId } from '@/contracts/explorer.ts'
import { cn } from '@/lib/cn.ts'
import { avatarOptions } from '@/pages/components/avatarOptions.ts'

export type AvatarSelectorProps = {
  selectedAvatar: AvatarId
  onSelect: (avatarId: AvatarId) => void
  disabled?: boolean
}

export function AvatarSelector({
  selectedAvatar,
  onSelect,
  disabled = false,
}: AvatarSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Choose your academy avatar"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      {avatarOptions.map((option) => {
        const isSelected = selectedAvatar === option.id
        const IconComponent = option.icon

        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelect(option.id)}
            className={cn(
              'flex flex-col items-start gap-3 rounded-surface border p-4 text-left transition-all',
              isSelected
                ? 'border-science bg-elevated shadow-surface ring-2 ring-science'
                : 'border-border bg-surface hover:border-science/50 hover:bg-surface/80',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <div className="flex w-full items-center justify-between">
              <div
                className={cn(
                  'flex size-10 items-center justify-center rounded-control',
                  isSelected ? 'bg-science text-on-bright' : 'bg-elevated text-secondary',
                )}
              >
                <IconComponent className="size-5" aria-hidden="true" />
              </div>
              <Badge variant={option.badgeVariant}>{isSelected ? 'Selected' : 'Avatar'}</Badge>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="font-heading text-base font-semibold text-foreground">
                {option.name}
              </span>
              <span className="text-xs text-secondary">{option.specialty}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
