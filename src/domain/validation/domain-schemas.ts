import { z } from 'zod';

// Domain validation schemas
export const clientDomainSchema = z.object({
  id: z.number().int().positive().nullable(),
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  balance: z.number().nonnegative(),
});

export const clientCreateDomainSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
});

export const clientUpdateDomainSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
});

export const amountDomainSchema = z
  .number()
  .positive('Amount must be positive')
  .finite('Amount must be a valid number');

// Account validation schemas
export const accountDomainSchema = z.object({
  id: z.number().int().positive().nullable(),
  userId: z.number().int().positive(),
  accountNumber: z.string().min(5).max(20),
  balance: z.number().nonnegative(),
  accountType: z.enum(['savings', 'checking']),
  status: z.enum(['active', 'inactive', 'frozen']),
});

export const accountCreateDomainSchema = z.object({
  userId: z.number().int().positive(),
  accountNumber: z.string().min(5).max(20),
  accountType: z.enum(['savings', 'checking']),
});

export const accountUpdateDomainSchema = z.object({
  accountType: z.enum(['savings', 'checking']),
  status: z.enum(['active', 'inactive', 'frozen']),
});

// Repository validation schemas
export const clientIdDomainSchema = z.number().int().positive();
export const accountIdDomainSchema = z.number().int().positive();
export const userIdDomainSchema = z.number().int().positive();

// Type exports for domain layer
export type ClientDomainData = z.infer<typeof clientDomainSchema>;
export type ClientCreateDomainData = z.infer<typeof clientCreateDomainSchema>;
export type ClientUpdateDomainData = z.infer<typeof clientUpdateDomainSchema>;
export type AccountDomainData = z.infer<typeof accountDomainSchema>;
export type AccountCreateDomainData = z.infer<typeof accountCreateDomainSchema>;
export type AccountUpdateDomainData = z.infer<typeof accountUpdateDomainSchema>;
export type AmountDomainData = z.infer<typeof amountDomainSchema>;
export type ClientIdDomainData = z.infer<typeof clientIdDomainSchema>;
export type AccountIdDomainData = z.infer<typeof accountIdDomainSchema>;
export type UserIdDomainData = z.infer<typeof userIdDomainSchema>;
