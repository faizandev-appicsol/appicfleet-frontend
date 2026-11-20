import { ar } from '@/i18n/messages/ar'
import { en, type MessageTree } from '@/i18n/messages/en'
import type { Locale } from '@/i18n/locales'

const catalogs: Record<Locale, MessageTree> = { en, ar }

type LeafPaths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : LeafPaths<T[K], `${Prefix}${K}.`>
}[keyof T & string]

export type MessageKey = LeafPaths<MessageTree>

export type MessageParams = Readonly<Record<string, string | number>>

function readPath(tree: unknown, path: string): string | undefined {
  const parts = path.split('.')
  let current: unknown = tree
  for (const part of parts) {
    if (typeof current !== 'object' || current === null || !(part in current)) return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : undefined
}

function interpolate(template: string, params?: MessageParams): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}

/**
 * Looks up a message. Unknown keys fall back to English, then to the key itself, so arbitrary
 * server-provided text passes through unchanged.
 */
export function translate(
  locale: Locale,
  key: MessageKey | string,
  params?: MessageParams,
): string {
  const template = readPath(catalogs[locale], key) ?? readPath(en, key) ?? key
  return interpolate(template, params)
}
