import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import type { ButtonVariant } from '@/components/ui/buttonStyles'
import { cn } from '@/utils/cn'

type MenuProps = {
  label: ReactNode
  children: ReactNode
  variant?: ButtonVariant
}

export function Menu({ label, children, variant = 'ghost' }: MenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant={variant}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </Button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="border-line bg-surface absolute end-0 z-[var(--z-dropdown)] mt-2 min-w-48 rounded-md border p-1 shadow-lg"
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

export function MenuItem({
  onSelect,
  children,
  disabled = false,
}: {
  onSelect: () => void
  children: ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      className={cn(
        'text-ink hover:bg-control flex w-full cursor-pointer rounded-lg px-3 py-2 text-start text-sm disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-white/8',
      )}
      onClick={() => {
        if (disabled) return
        onSelect()
      }}
    >
      {children}
    </button>
  )
}
