import { appConfig } from '@/config/app.config'

export function readRedirectPath(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('from' in state)) {
    return appConfig.routes.home
  }

  const from = (state as { from?: unknown }).from
  if (typeof from !== 'object' || from === null || !('pathname' in from)) {
    return appConfig.routes.home
  }

  const pathname = (from as { pathname?: unknown }).pathname
  if (typeof pathname !== 'string' || !pathname.startsWith('/') || pathname.startsWith('//')) {
    return appConfig.routes.home
  }

  return pathname
}
