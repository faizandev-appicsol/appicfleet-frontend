export type AppEnv = 'development' | 'staging' | 'production' | 'test'

function isAppEnv(value: string): value is AppEnv {
  return (
    value === 'development' || value === 'staging' || value === 'production' || value === 'test'
  )
}

function readEnv() {
  const apiUrl = import.meta.env.VITE_API_URL?.trim()
  const appEnvValue = import.meta.env.VITE_APP_ENV?.trim() || 'development'

  if (!apiUrl) {
    throw new Error('Missing VITE_API_URL. Copy .env.example to .env and set the API base URL.')
  }

  if (!isAppEnv(appEnvValue)) {
    throw new Error(
      `Invalid VITE_APP_ENV "${appEnvValue}". Expected development, staging, production, or test.`,
    )
  }

  return {
    apiUrl: apiUrl.replace(/\/+$/, ''),
    appEnv: appEnvValue,
    isDevelopment: appEnvValue === 'development',
  }
}

export const env = readEnv()
