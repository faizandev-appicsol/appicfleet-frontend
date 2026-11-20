import { translate, useTranslation } from '@/i18n'

/** Localized display name for a role code. Unknown or custom roles fall back to the raw value. */
export function useRoleLabel() {
  const { locale } = useTranslation()

  return (role: string): string => {
    const key = `roles.names.${role.toLowerCase()}`
    const label = translate(locale, key)
    return label === key ? role : label
  }
}
