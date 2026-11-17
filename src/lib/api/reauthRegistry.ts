import type { BaseQueryApi, FetchArgs } from '@reduxjs/toolkit/query'

export type ReauthExtraOptions = {
  skipReauth?: boolean
}

type ReauthHandler = (api: BaseQueryApi) => Promise<boolean>

let handler: ReauthHandler | null = null
const skipPaths = new Set<string>()

export function registerReauthHandler(next: ReauthHandler): void {
  handler = next
}

export function skipReauthFor(path: string): void {
  skipPaths.add(path)
}

export function shouldSkipReauth(
  args: string | FetchArgs,
  extraOptions?: ReauthExtraOptions,
): boolean {
  if (extraOptions?.skipReauth) return true

  const url = typeof args === 'string' ? args : args.url
  const path = url.split('?')[0] ?? url

  for (const skipPath of skipPaths) {
    if (path === skipPath || path.endsWith(skipPath)) return true
  }

  return false
}

export function runReauth(api: BaseQueryApi): Promise<boolean> {
  if (!handler) return Promise.resolve(false)
  return handler(api)
}
