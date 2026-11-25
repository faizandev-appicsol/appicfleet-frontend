
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

type DropdownOption = {
  label: string
  value: string
}

type DropdownProps = {
  options: DropdownOption[]
  onSelect: (value: string) => void
  children: ReactNode
  className?: string
  align?: 'left' | 'right'
  disabled?: boolean
}

export function Dropdown({
  options,
  onSelect,
  children,
  className = '',
  align = 'right',
  disabled = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <div
        className="flex items-center"
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev)
        }}
      >
        {children}

        <span
          className={`-ml-8 mr-3 pointer-events-none flex items-center text-white transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        >
          <ChevronDown className="size-4" />
        </span>
      </div>

      {open && !disabled && (
        <div
          className={`absolute z-50 mt-2 min-w-48 rounded-md border bg-white py-1 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          role="menu"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitem"
              onClick={() => {
                onSelect(option.value)
                setOpen(false)
              }}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
