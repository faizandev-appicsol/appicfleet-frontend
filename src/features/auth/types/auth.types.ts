import { z } from 'zod'

export const sessionUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().min(1),
  name: z.string().min(1),
  roles: z.array(z.string()),
})

export const sessionResponseSchema = z.object({
  accessToken: z.string().min(1),
  expiresIn: z.number().positive().optional(),
  refreshToken: z.string().min(1).optional(),
  user: sessionUserSchema,
})

export type SessionUser = z.infer<typeof sessionUserSchema>

export type AuthSession = {
  accessToken: string
  expiresAt: string
  refreshToken?: string
  user: SessionUser
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
}

const DEFAULT_ACCESS_TOKEN_SECONDS = 900

export function parseAuthSession(data: unknown): AuthSession | null {
  const parsed = sessionResponseSchema.safeParse(data)
  if (!parsed.success) return null

  const expiresIn = parsed.data.expiresIn ?? DEFAULT_ACCESS_TOKEN_SECONDS

  return {
    accessToken: parsed.data.accessToken,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    refreshToken: parsed.data.refreshToken,
    user: parsed.data.user,
  }
}
