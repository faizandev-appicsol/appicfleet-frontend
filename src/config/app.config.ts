export const appConfig = {
  name: 'Fleet Management',
  description: 'Operations console for vehicles, drivers, and dispatch.',
  routes: {
    home: '/',
    login: '/login',
    unauthorized: '/unauthorized',
    users: '/users',
  },
  apiTimeoutMs: 20_000,
  accessTokenRefreshSkewMs: 30_000,
} as const
