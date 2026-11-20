/**
 * Formats a calendar date (`YYYY-MM-DD`) without timezone drift: the API stores these as UTC
 * midnight, so they are rendered in UTC. Unparseable values are returned unchanged.
 */
export function formatDateOnly(value: string, locale?: string): string {
  const date = new Date(`${value.slice(0, 10)}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}
