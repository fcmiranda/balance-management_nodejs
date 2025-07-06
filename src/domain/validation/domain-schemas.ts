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

// Repository validation schemas
export const clientIdDomainSchema = z.number().int().positive();

// Type exports for domain layer
export type ClientDomainData = z.infer<typeof clientDomainSchema>;
export type ClientCreateDomainData = z.infer<typeof clientCreateDomainSchema>;
export type ClientUpdateDomainData = z.infer<typeof clientUpdateDomainSchema>;
export type AmountDomainData = z.infer<typeof amountDomainSchema>;
export type ClientIdDomainData = z.infer<typeof clientIdDomainSchema>;
