import { cn } from '@/utils/cn'

const variants = {
  primary: 'bg-brand text-brand-contrast hover:bg-brand-strong',
  secondary: 'border border-line bg-surface text-ink hover:bg-canvas',
  ghost: 'text-ink hover:bg-canvas',
  danger: 'bg-danger text-danger-contrast hover:brightness-110',
} as const

const sizes = {
  sm: 'h-8 px-2.5 text-xs',
  md: 'h-10 px-3.5 text-sm',
  icon: 'size-10',
} as const

export type ButtonVariant = keyof typeof variants
export type ButtonSize = keyof typeof sizes

type ButtonStyleProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

export function buttonClassName({
  variant = 'primary',
  size = 'md',
  className,
}: ButtonStyleProps = {}): string {
  return cn(
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    sizes[size],
    className,
  )
}
