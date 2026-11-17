import { MonitorIcon, MoonIcon, SunIcon } from '@/components/ui/icons'
import { useTheme } from '@/features/ui/hooks/useTheme'
import type { ThemePreference } from '@/features/ui/types/ui.types'
import { cn } from '@/utils/cn'

const labels: Record<ThemePreference, string> = {
  light: 'Light theme',
  dark: 'Dark theme',
  system: 'System theme',
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, cycleTheme } = useTheme()
  const Icon = theme === 'dark' ? MoonIcon : theme === 'light' ? SunIcon : MonitorIcon

  return (
    <button
      type="button"
      className={cn(
        'text-ink hover:bg-canvas focus-visible:outline-brand inline-flex size-10 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
      aria-label={`${labels[theme]}. Activate to change theme.`}
      onClick={cycleTheme}
    >
      <Icon />
    </button>
  )
}
