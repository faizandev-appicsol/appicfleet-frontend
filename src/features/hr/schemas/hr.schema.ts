import { z } from 'zod'

export const employeeSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  employeeNumber: z.string(),
  firstName: z.string(),
  middleName: z.string().nullable().optional(),
  lastName: z.string(),
  preferredName: z.string().nullable().optional(),
  dateOfBirth: z.union([z.string(), z.literal('[REDACTED]')]).nullable().optional(),
  nationality: z.union([z.string(), z.literal('[REDACTED]')]).nullable().optional(),
  personalEmail: z.union([z.string(), z.literal('[REDACTED]')]).nullable().optional(),
  workEmail: z.string().nullable().optional(),
  personalPhone: z.union([z.string(), z.literal('[REDACTED]')]).nullable().optional(),
  workPhone: z.string().nullable().optional(),
  status: z.string(),
  employmentType: z.string(),
  jobTitle: z.string().nullable().optional(),
  departmentId: z.string().nullable().optional(),
  positionId: z.string().nullable().optional(),
  managerEmployeeId: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  hireDate: z.string().nullable().optional(),
  notes: z.union([z.string(), z.literal('[REDACTED]')]).nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Employee = z.infer<typeof employeeSchema>

export const departmentSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string().nullable().optional(),
  name: z.string(),
  code: z.string(),
  description: z.string().nullable().optional(),
  managerEmployeeId: z.string().nullable().optional(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Department = z.infer<typeof departmentSchema>

export const positionSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  departmentId: z.string().nullable().optional(),
  name: z.string(),
  code: z.string(),
  description: z.string().nullable().optional(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Position = z.infer<typeof positionSchema>

export const hrDocumentSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  documentType: z.string(),
  documentNumber: z.string().nullable().optional(),
  issuedOn: z.string().nullable().optional(),
  expiresOn: z.string().nullable().optional(),
  status: z.string(),
  originalFilename: z.string(),
  mimeType: z.string(),
  byteSize: z.number(),
  createdAt: z.string(),
})

export type HrDocument = z.infer<typeof hrDocumentSchema>
