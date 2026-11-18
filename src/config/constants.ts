export const STORAGE_KEYS = {
  theme: 'fleet.theme',
  sidebarCollapsed: 'fleet.sidebar-collapsed',
} as const

export const AUTH_ENDPOINTS = {
  login: '/auth/login',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  me: '/auth/me',
} as const
