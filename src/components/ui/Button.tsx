import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/cn.ts'
import { focusRing } from '@/components/ui/focusRing.ts'

export type ButtonVariant =
  'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'

export type ButtonSize = 'small' | 'medium' | 'large'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: ReactNode
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-on-bright hover:brightness-110 disabled:bg-elevated disabled:text-muted disabled:hover:brightness-100',
  secondary:
    'border border-border bg-elevated text-foreground hover:bg-surface disabled:bg-elevated disabled:text-muted',
  outline:
    'border border-accent bg-transparent text-foreground hover:bg-elevated disabled:border-border disabled:text-muted',
  ghost:
    'bg-transparent text-foreground hover:bg-elevated disabled:bg-transparent disabled:text-muted',
  destructive:
    'bg-danger text-on-bright hover:brightness-110 disabled:bg-elevated disabled:text-muted disabled:hover:brightness-100',
}

const sizeClass: Record<ButtonSize, string> = {
  small: 'min-h-11 gap-2 px-3 text-sm',
  medium: 'min-h-11 gap-2 px-4 text-base',
  large: 'min-h-12 gap-2 px-5 text-base',
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
        'inline-flex items-center justify-center rounded-control font-medium motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out motion-safe:active:scale-[0.96] disabled:cursor-not-allowed disabled:active:scale-100',
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
          className="size-4 motion-safe:animate-spin"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  )
}
