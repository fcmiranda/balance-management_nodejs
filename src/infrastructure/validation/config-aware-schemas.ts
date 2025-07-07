import { z } from 'zod';
import { config } from '../config/config';

/**
 * Configuration-aware validation schemas
 * These schemas use values from the configuration instead of hardcoded values
 */

// Base schemas using configuration
export const nameSchema = z
  .string()
  .min(
    config.validation.nameMinLength,
    `Name must be at least ${config.validation.nameMinLength} characters long`,
  )
  .max(
    config.validation.nameMaxLength,
    `Name cannot exceed ${config.validation.nameMaxLength} characters`,
  )
  .trim();

export const emailSchema = z
  .string()
  .email('Valid email is required')
  .toLowerCase()
  .trim()
  .regex(new RegExp(config.validation.emailPattern), 'Invalid email format');

export const passwordSchema = z
  .string()
  .min(
    config.validation.passwordMinLength,
    `Password must be at least ${config.validation.passwordMinLength} characters long`,
  )
  .max(
    config.validation.passwordMaxLength,
    `Password cannot exceed ${config.validation.passwordMaxLength} characters`,
  );

export const amountSchema = z
  .number()
  .min(
    config.validation.minTransactionAmount,
    `Amount must be at least ${config.validation.minTransactionAmount}`,
  )
  .max(
    config.validation.maxTransactionAmount,
    `Amount cannot exceed ${config.validation.maxTransactionAmount}`,
  )
  .positive('Amount must be positive')
  .finite('Amount must be a valid number');

export const accountNumberSchema = z
  .string()
  .min(
    config.validation.accountNumberMinLength,
    `Account number must be at least ${config.validation.accountNumberMinLength} characters`,
  )
  .max(
    config.validation.accountNumberMaxLength,
    `Account number cannot exceed ${config.validation.accountNumberMaxLength} characters`,
  )
  .regex(
    new RegExp(config.validation.accountNumberPattern),
    `Account number must match pattern: ${config.validation.accountNumberPattern}`,
  );

export const balanceSchema = z
  .number()
  .min(0, 'Balance cannot be negative')
  .max(
    config.validation.maxBalanceValue,
    `Balance cannot exceed ${config.validation.maxBalanceValue}`,
  )
  .finite('Balance must be a valid number');

// ID schemas using configuration
export const positiveIntegerSchema = z
  .number()
  .int('Must be an integer')
  .min(config.validation.minPositiveInteger, 'Must be a positive integer');

export const clientIdSchema = positiveIntegerSchema.refine(
  (val) => val > 0,
  'Client ID must be a positive integer',
);

export const userIdSchema = positiveIntegerSchema.refine(
  (val) => val > 0,
  'User ID must be a positive integer',
);

export const accountIdSchema = positiveIntegerSchema.refine(
  (val) => val > 0,
  'Account ID must be a positive integer',
);

// Role schema
export const roleSchema = z.enum(['admin', 'client'], {
  errorMap: () => ({ message: 'Role must be either "admin" or "client"' }),
});

// Request DTOs validation schemas
export const createClientRequestSchema = z.object({
  name: nameSchema,
  email: emailSchema,
});

export const updateClientRequestSchema = z.object({
  id: clientIdSchema,
  name: nameSchema,
  email: emailSchema,
});

export const getClientByIdRequestSchema = z.object({
  id: clientIdSchema,
});

export const deleteClientRequestSchema = z.object({
  id: clientIdSchema,
});

export const depositRequestSchema = z.object({
  clientId: clientIdSchema,
  amount: amountSchema,
});

export const withdrawRequestSchema = z.object({
  clientId: clientIdSchema,
  amount: amountSchema,
});

// Account request schemas
export const createAccountRequestSchema = z.object({
  name: nameSchema,
});

export const accountDepositRequestSchema = z.object({
  amount: amountSchema,
});

export const accountWithdrawRequestSchema = z.object({
  amount: amountSchema,
});

// URL parameter validation schemas
export const clientIdParamSchema = z.object({
  id: z.string().transform((val) => {
    const parsed = Number.parseInt(val, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      throw new Error('Invalid client ID');
    }
    return parsed;
  }),
});

export const accountIdParamSchema = z.object({
  accountId: z.string().transform((val) => {
    const parsed = Number.parseInt(val, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      throw new Error('Invalid account ID');
    }
    return parsed;
  }),
});

// Query parameter validation schemas
export const paginationQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .optional(),
  limit: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .optional(),
});

// Auth schemas using configuration
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['admin', 'client']).default('client'),
});

// User schemas
export const createUserRequestSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema.optional(),
});

export const updateUserRequestSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  role: roleSchema.optional(),
});

// Type exports for use in the application
export type CreateClientRequest = z.infer<typeof createClientRequestSchema>;
export type UpdateClientRequest = z.infer<typeof updateClientRequestSchema>;
export type GetClientByIdRequest = z.infer<typeof getClientByIdRequestSchema>;
export type DeleteClientRequest = z.infer<typeof deleteClientRequestSchema>;
export type DepositRequest = z.infer<typeof depositRequestSchema>;
export type WithdrawRequest = z.infer<typeof withdrawRequestSchema>;
export type CreateAccountRequest = z.infer<typeof createAccountRequestSchema>;
export type AccountDepositRequest = z.infer<typeof accountDepositRequestSchema>;
export type AccountWithdrawRequest = z.infer<typeof accountWithdrawRequestSchema>;
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;

/**
 * Configuration validation helpers
 * These functions validate that configuration values are appropriate for the schemas
 */
export const validateConfigurationRules = () => {
  const { validation } = config;

  // Validate that min values are less than max values
  if (validation.nameMinLength >= validation.nameMaxLength) {
    throw new Error('nameMinLength must be less than nameMaxLength');
  }

  if (validation.passwordMinLength >= validation.passwordMaxLength) {
    throw new Error('passwordMinLength must be less than passwordMaxLength');
  }

  if (validation.accountNumberMinLength >= validation.accountNumberMaxLength) {
    throw new Error('accountNumberMinLength must be less than accountNumberMaxLength');
  }

  if (validation.minTransactionAmount >= validation.maxTransactionAmount) {
    throw new Error('minTransactionAmount must be less than maxTransactionAmount');
  }

  // Validate regex patterns
  try {
    new RegExp(validation.accountNumberPattern);
    new RegExp(validation.emailPattern);
  } catch (error) {
    throw new Error(`Invalid regex pattern in configuration: ${error}`);
  }

  return true;
};
