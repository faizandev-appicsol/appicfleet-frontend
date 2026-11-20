export const themePreferences = ['light', 'dark', 'system'] as const

export type ThemePreference = (typeof themePreferences)[number]

export type { Locale } from '@/i18n/locales'
