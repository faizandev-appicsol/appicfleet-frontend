import { z } from 'zod'
import { emailSchema, passwordSchema, personNameSchema } from '@/schemas/common.schema'

export const registerSchema = z
  .object({
    name: personNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Passwords do not match',
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
