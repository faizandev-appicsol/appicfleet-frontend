import { useAppSelector } from '@/app/hooks'
import { translate, type MessageKey, type MessageParams } from '@/i18n/translate'

export function useTranslation() {
  const locale = useAppSelector((state) => state.ui.locale)

  return {
    locale,
    t: (key: MessageKey, params?: MessageParams) => translate(locale, key, params),
    /**
     * Translates a message that may be a catalog key (validation and API error keys)
     * or plain text from the server. Plain text is returned unchanged.
     */
    tm: (message: string | undefined, params?: MessageParams) =>
      message ? translate(locale, message, params) : undefined,
  }
}
