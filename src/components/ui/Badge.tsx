import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

const tones = {
  neutral: 'bg-canvas text-ink',
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
} as const

export type BadgeTone = keyof typeof tones

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}
