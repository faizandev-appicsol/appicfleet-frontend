/**
 * In-memory refresh token holder.
 *
 * The access token lives in the auth slice, also in memory. Neither token is written
 * to localStorage or sessionStorage. A page reload clears this value.
 *
 * Preferred backend contract: set the refresh token as an HttpOnly, Secure, SameSite
 * cookie and accept POST /auth/refresh with credentials. If the API also returns a
 * refresh token in JSON, it is kept here only until the tab is closed and is sent
 * back to the refresh endpoint. It is never persisted.
 */
let refreshToken: string | null = null

export const tokenStorage = {
  getRefreshToken(): string | null {
    return refreshToken
  },
  setRefreshToken(token: string | null): void {
    refreshToken = token
  },
  clear(): void {
    refreshToken = null
  },
}
