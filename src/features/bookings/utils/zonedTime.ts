/** Offset of `timeZone` at `instant`: wall-clock-as-UTC minus the real instant. */
function zoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant)
  const map: Record<string, string> = {}
  for (const part of parts) {
    if (part.type !== 'literal') map[part.type] = part.value
  }
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour) % 24,
    Number(map.minute),
    Number(map.second),
  )
  return asUtc - instant.getTime()
}

/**
 * Interprets a date and time as wall-clock time in `timeZone` and returns the UTC instant.
 * Pickup and return fields use the branch timezone, not the browser timezone.
 */
export function zonedLocalToUtc(date: string, time: string, timeZone: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0))
  const corrected = new Date(utcGuess.getTime() - zoneOffsetMs(utcGuess, timeZone))
  return new Date(utcGuess.getTime() - zoneOffsetMs(corrected, timeZone))
}

/** Date and time parts of an instant as shown in `timeZone`, for form inputs. */
export function partsInZone(iso: string, timeZone: string): { date: string; time: string } {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return { date: '', time: '' }
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const map: Record<string, string> = {}
  for (const part of formatted) {
    if (part.type !== 'literal') map[part.type] = part.value
  }
  return {
    date: `${map.year}-${map.month}-${map.day}`,
    time: `${map.hour}:${map.minute}`,
  }
}

export function formatInZone(iso: string, timeZone: string, locale: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(date)
}
