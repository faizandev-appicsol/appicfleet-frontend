import { MonitorIcon, MoonIcon, SunIcon } from '@/components/ui/icons'
import { useTheme } from '@/features/ui/hooks/useTheme'
import type { ThemePreference } from '@/features/ui/types/ui.types'
import { useTranslation } from '@/i18n'
import { cn } from '@/utils/cn'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, cycleTheme } = useTheme()
  const { t } = useTranslation()
  const Icon = theme === 'dark' ? MoonIcon : theme === 'light' ? SunIcon : MonitorIcon

  const labels: Record<ThemePreference, string> = {
    light: t('common.light'),
    dark: t('common.dark'),
    system: t('common.system'),
  }

  return (
    <button
      type="button"
      className={cn(
        'text-ink hover:bg-control focus-visible:outline-brand inline-flex size-10 cursor-pointer items-center justify-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:bg-white/8',
        className,
      )}
      aria-label={`${t('common.theme')}: ${labels[theme]}`}
      onClick={cycleTheme}
    >
      <Icon />
    </button>
  )
}
