import { Check } from 'lucide-react'
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
              'group relative flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer backdrop-blur-md',
              isSelected
                ? 'border-[#d4ff9a] bg-[#d4ff9a]/10 shadow-[0_0_24px_rgba(212,255,154,0.25)] ring-1 ring-[#d4ff9a]'
                : 'border-white/10 bg-white/[0.04] hover:border-[#d4ff9a]/40 hover:-translate-y-1 hover:bg-white/[0.07]',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <div className="flex w-full items-center justify-between">
              <div
                className={cn(
                  'flex size-10 items-center justify-center rounded-xl transition-colors',
                  isSelected
                    ? 'bg-[#d4ff9a] text-[#050a14] shadow-[0_0_12px_rgba(212,255,154,0.5)]'
                    : 'bg-white/10 text-[#9aa7bd] group-hover:text-white group-hover:bg-white/15',
                )}
              >
                <IconComponent className="size-5" aria-hidden="true" />
              </div>

              {isSelected ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-[#d4ff9a] bg-[#d4ff9a]/15 px-2.5 py-0.5 rounded-full border border-[#d4ff9a]/30">
                  <Check size={12} aria-hidden="true" />
                  <span>Selected</span>
                </span>
              ) : (
                <span className="text-[11px] font-medium text-[#9aa7bd] bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                  Insignia
                </span>
              )}
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="font-heading text-base font-semibold text-white group-hover:text-[#d4ff9a] transition-colors">
                {option.name}
              </span>
              <span className="text-xs text-[#9aa7bd] leading-tight">
                {option.specialty}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
