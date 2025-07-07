import { z } from 'zod';

// Base schemas
export const clientIdSchema = z.number().int().positive('Client ID must be a positive integer');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters long')
  .max(100, 'Name cannot exceed 100 characters')
  .trim();

export const emailSchema = z.string().email('Valid email is required').toLowerCase().trim();

export const amountSchema = z
  .number()
  .positive('Amount must be positive')
  .finite('Amount must be a valid number')
  .refine((val) => val > 0, 'Amount must be greater than 0');

// User validation schemas
export const userIdSchema = z.number().int().positive('User ID must be a positive integer');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters long')
  .max(100, 'Password cannot exceed 100 characters');

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
  accountType: z.enum(['savings', 'checking'], {
    errorMap: () => ({ message: 'Account type must be either "savings" or "checking"' }),
  }),
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

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
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
export type ClientIdParam = z.infer<typeof clientIdParamSchema>;
export type AccountIdParam = z.infer<typeof accountIdParamSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;
