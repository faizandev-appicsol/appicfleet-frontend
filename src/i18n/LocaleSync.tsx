import { useEffect } from 'react'
import { useAppSelector } from '@/app/hooks'
import { localeDirection } from '@/i18n/locales'

export function LocaleSync() {
  const locale = useAppSelector((state) => state.ui.locale)

  useEffect(() => {
    const root = document.documentElement
    root.lang = locale
    root.dir = localeDirection(locale)
  }, [locale])

  return null
}
