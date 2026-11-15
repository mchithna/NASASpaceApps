import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/cn.ts'
import { focusRing } from '@/components/ui/focusRing.ts'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'

export type ButtonSize = 'small' | 'medium' | 'large'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: ReactNode
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-[#d4ff9a] text-[#050a14] font-semibold rounded-full border border-[#eaffc7] shadow-[0_0_20px_rgba(212,255,154,0.22)] hover:bg-[#e4ffb8] hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(212,255,154,0.4)] active:translate-y-0 disabled:bg-[#152333] disabled:text-[#8c9bb3] disabled:border-transparent disabled:shadow-none disabled:hover:translate-y-0',
  secondary:
    'bg-white/[0.04] text-[#ffffff] border border-white/20 rounded-full backdrop-blur-md hover:border-[#d4ff9a] hover:text-[#d4ff9a] hover:bg-white/[0.08] hover:-translate-y-0.5 active:translate-y-0 disabled:bg-transparent disabled:text-[#8c9bb3] disabled:border-white/10 disabled:hover:translate-y-0',
  outline:
    'border border-[#d4ff9a]/60 bg-transparent text-[#ffffff] rounded-full hover:border-[#d4ff9a] hover:bg-[#d4ff9a]/10 hover:-translate-y-0.5 disabled:border-white/10 disabled:text-[#8c9bb3]',
  ghost:
    'bg-transparent text-[#9aa7bd] hover:text-[#ffffff] hover:bg-white/[0.06] rounded-full disabled:bg-transparent disabled:text-[#8c9bb3]',
  destructive:
    'bg-danger text-[#ffffff] rounded-full hover:brightness-110 disabled:bg-[#152333] disabled:text-[#8c9bb3]',
}

const sizeClass: Record<ButtonSize, string> = {
  small: 'min-h-9 gap-1.5 px-3.5 text-xs',
  medium: 'min-h-11 gap-2 px-5 text-sm',
  large: 'min-h-12 gap-2.5 px-6 text-base',
}

export function Button({
  variant = 'primary',
  size = 'medium',
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading)

  return (
    <button
      {...props}
      type={type}
      className={cn(
        'group inline-flex items-center justify-center font-medium transition-all duration-200 ease-out cursor-pointer disabled:cursor-not-allowed select-none',
        focusRing,
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      disabled={isDisabled}
      aria-busy={loading ? true : undefined}
    >
      {loading ? (
        <LoaderCircle
          className="size-4 motion-safe:animate-spin shrink-0"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  )
}
