/**
 * Preferences only. Never store access tokens, refresh tokens, or secrets here.
 * Vite apps run in the browser, so localStorage is readable by any script on the page.
 */
export function readStorage(key: string): string | null {
  if (typeof localStorage === 'undefined') return null

  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string): void {
  if (typeof localStorage === 'undefined') return

  try {
    localStorage.setItem(key, value)
  } catch {
    // Quota and privacy restrictions should not break the interface.
  }
}
