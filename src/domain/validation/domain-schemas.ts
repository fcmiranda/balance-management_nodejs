import { z } from 'zod';
import { config } from '../../infrastructure/config/config';

// Domain validation schemas using configuration
export const clientDomainSchema = z.object({
  id: z.number().int().positive().nullable(),
  name: z.string().min(config.validation.nameMinLength).max(config.validation.nameMaxLength).trim(),
  email: z.string().email().toLowerCase().trim().regex(new RegExp(config.validation.emailPattern)),
  balance: z.number().min(0).max(config.validation.maxBalanceValue),
});

export const clientCreateDomainSchema = z.object({
  name: z.string().min(config.validation.nameMinLength).max(config.validation.nameMaxLength).trim(),
  email: z.string().email().toLowerCase().trim().regex(new RegExp(config.validation.emailPattern)),
});

export const clientUpdateDomainSchema = z.object({
  name: z.string().min(config.validation.nameMinLength).max(config.validation.nameMaxLength).trim(),
  email: z.string().email().toLowerCase().trim().regex(new RegExp(config.validation.emailPattern)),
});

export const amountDomainSchema = z
  .number()
  .min(config.validation.minTransactionAmount, 'Amount must be positive')
  .max(config.validation.maxTransactionAmount)
  .finite('Amount must be a valid number');

// Account validation schemas using configuration
export const accountDomainSchema = z.object({
  id: z.number().int().positive().nullable(),
  userId: z.number().int().positive(),
  accountNumber: z
    .string()
    .min(config.validation.accountNumberMinLength)
    .max(config.validation.accountNumberMaxLength)
    .regex(
      new RegExp(config.validation.accountNumberPattern),
      'Account number must be a 10-digit number starting with 1-9',
    ),
  balance: z.number().min(0).max(config.validation.maxBalanceValue),
});

export const accountCreateDomainSchema = z.object({
  userId: z.number().int().positive(),
  accountNumber: z
    .string()
    .min(config.validation.accountNumberMinLength)
    .max(config.validation.accountNumberMaxLength)
    .regex(
      new RegExp(config.validation.accountNumberPattern),
      'Account number must be a 10-digit number starting with 1-9',
    ),
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
export type AmountDomainData = z.infer<typeof amountDomainSchema>;
export type ClientIdDomainData = z.infer<typeof clientIdDomainSchema>;
export type AccountIdDomainData = z.infer<typeof accountIdDomainSchema>;
export type UserIdDomainData = z.infer<typeof userIdDomainSchema>;
