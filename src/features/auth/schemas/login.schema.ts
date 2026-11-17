import { z } from 'zod'
import { emailSchema } from '@/schemas/common.schema'

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
