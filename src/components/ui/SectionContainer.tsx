import type { ReactNode } from 'react'
import { cn } from '@/lib/cn.ts'

type SectionContainerProps = {
  children: ReactNode
  className?: string
}

export function SectionContainer({
  children,
  className,
}: SectionContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full max-w-5xl px-4 py-page sm:px-6', className)}
    >
      {children}
    </div>
  )
}
