/** Local calendar date as `YYYY-MM-DD` for `<input type="date" min=…>`. */
export function todayDateInput(now = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** True when `YYYY-MM-DD` is today or a future local calendar day. */
export function isTodayOrFutureDate(value: string, now = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return value >= todayDateInput(now)
}
