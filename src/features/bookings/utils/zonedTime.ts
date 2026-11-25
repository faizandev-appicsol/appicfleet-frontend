function safeFormatToParts(instant: Date, timeZone: string) {
  if (Number.isNaN(instant.getTime())) return null
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || 'UTC',
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(instant)
  } catch {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).formatToParts(instant)
    } catch {
      return null
    }
  }
}

/** Offset of `timeZone` at `instant`: wall-clock-as-UTC minus the real instant. */
function zoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = safeFormatToParts(instant, timeZone)
  if (!parts) return 0
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
  if (!date || !time) return new Date(NaN)
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) return new Date(NaN)
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0))
  if (Number.isNaN(utcGuess.getTime())) return new Date(NaN)
  const offset1 = zoneOffsetMs(utcGuess, timeZone)
  const corrected = new Date(utcGuess.getTime() - offset1)
  if (Number.isNaN(corrected.getTime())) return new Date(NaN)
  const offset2 = zoneOffsetMs(corrected, timeZone)
  return new Date(utcGuess.getTime() - offset2)
}

/** Date and time parts of an instant as shown in `timeZone`, for form inputs. */
export function partsInZone(iso: string, timeZone: string): { date: string; time: string } {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return { date: '', time: '' }
  try {
    const formatted = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone || 'UTC',
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
  } catch {
    try {
      return {
        date: date.toISOString().slice(0, 10),
        time: date.toISOString().slice(11, 16),
      }
    } catch {
      return { date: '', time: '' }
    }
  }
}

export function formatInZone(iso: string, timeZone: string, locale: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: timeZone || 'UTC',
    }).format(date)
  } catch {
    try {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      }).format(date)
    } catch {
      return date.toLocaleString(locale)
    }
  }
}
