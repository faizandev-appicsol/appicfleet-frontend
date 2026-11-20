export const STORAGE_KEYS = {
  theme: 'fleet.theme',
  sidebarCollapsed: 'fleet.sidebar-collapsed',
  locale: 'fleet.locale',
} as const

export const AUTH_ENDPOINTS = {
  login: '/auth/login',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  me: '/auth/me',
  changePassword: '/auth/change-password',
} as const

/** API paths relative to the configured `/api/v1` base URL. */
export const API_ENDPOINTS = {
  users: '/users',
  organizations: '/organizations',
  legalEntities: '/legal-entities',
  branches: '/branches',
  vehicles: '/vehicles',
  customers: '/customers',
  bookings: '/bookings',
  contracts: '/contracts',
  invoices: '/invoices',
  payments: '/payments',
  receipts: '/receipts',
  creditNotes: '/credit-notes',
  debitNotes: '/debit-notes',
  deposits: '/deposits',
  vendors: '/vendors',
  lpos: '/lpos',
  vendorBills: '/vendor-bills',
  expenses: '/expenses',
  workOrders: '/work-orders',
  serviceReminders: '/service-reminders',
  fines: '/fines',
  tolls: '/tolls',
  refunds: '/refunds',
  fineTollImports: '/fine-toll-imports',
  accounting: '/accounting',
  tax: '/tax',
  reporting: '',
  investors: '/investors',
  investor: '/investor',
  hr: '/hr',
  payroll: '/payroll',
  workforce: '/workforce',
  recruitment: '/recruitment',
  performance: '/performance',
  roles: '/roles',
  permissions: '/permissions',
} as const

export const API_DEFAULT_PAGE_SIZE = 20

/** Largest page size the API accepts; used by selector lists. */
export const API_MAX_PAGE_SIZE = 100
