import type { ComponentProps } from 'react'
import { buttonClassName, type ButtonSize, type ButtonVariant } from '@/components/ui/buttonStyles'

type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span
          className="size-4 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  )
}
