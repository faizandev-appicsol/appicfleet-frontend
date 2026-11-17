export const themePreferences = ['light', 'dark', 'system'] as const

export type ThemePreference = (typeof themePreferences)[number]
