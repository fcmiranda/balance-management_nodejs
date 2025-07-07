import type { NextFunction, Request, Response } from 'express';
import { ZodError, type z } from 'zod';

// Validation error response interface
interface ValidationErrorResponse {
  error: string;
  details?: string[];
}

// Validation target types
type ValidationTarget = 'body' | 'params' | 'query' | 'headers';

// Error messages for different validation targets
const ERROR_MESSAGES: Record<ValidationTarget, string> = {
  body: 'Invalid request body',
  params: 'Invalid URL parameters',
  query: 'Invalid query parameters',
  headers: 'Invalid request headers',
};

// Validation context descriptions for error messages
const VALIDATION_CONTEXTS: Record<ValidationTarget, string> = {
  body: 'Validation failed',
  params: 'Invalid URL parameters',
  query: 'Invalid query parameters',
  headers: 'Invalid request headers',
};

/**
 * Centralized validation error handler
 * Processes ZodError and creates consistent error responses
 */
function handleValidationError(error: unknown, res: Response, target: ValidationTarget): void {
  if (error instanceof ZodError) {
    const errorMessages = error.errors.map((err) => {
      const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
      return `${path}${err.message}`;
    });

    const response: ValidationErrorResponse = {
      error: VALIDATION_CONTEXTS[target],
      details: errorMessages,
    };
    res.status(400).json(response);
    return;
  }

  // Handle non-Zod errors
  const response: ValidationErrorResponse = {
    error: ERROR_MESSAGES[target],
  };
  res.status(400).json(response);
}

/**
 * Generic validation middleware factory
 * Consolidates all validation logic into a single, configurable function
 *
 * @param target - Which part of the request to validate ('body', 'params', 'query', 'headers')
 * @param schema - Zod schema to validate against
 * @param options - Additional configuration options
 */
export function validate(
  target: ValidationTarget,
  schema: z.ZodSchema<unknown>,
  options: {
    /** Whether to merge validated data back into the original request object */
    merge?: boolean;
    /** Whether to replace the original data with validated data (default: true for body, false for others) */
    replace?: boolean;
  } = {},
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[target];
      const validatedData = schema.parse(data);

      // Determine whether to replace or merge based on target and options
      const shouldReplace = options.replace ?? target === 'body';
      const shouldMerge = options.merge ?? !shouldReplace;

      if (shouldReplace) {
        // Replace the entire target with validated data
        (req as any)[target] = validatedData;
      } else if (shouldMerge) {
        // Merge validated data back into the original target
        Object.assign(req[target], validatedData);
      }

      next();
    } catch (error) {
      handleValidationError(error, res, target);
    }
  };
}

// Backward compatibility functions - these now use the consolidated validate function
export function validateSchema(schema: z.ZodSchema<unknown>) {
  return validate('body', schema);
}

export function validateParams(schema: z.ZodSchema<unknown>) {
  return validate('params', schema, { merge: true });
}

export function validateQuery(schema: z.ZodSchema<unknown>) {
  return validate('query', schema, { merge: true });
}

export function validateBody(schema: z.ZodSchema<unknown>) {
  return validate('body', schema, { replace: true });
}

// Combine body and params validation using the consolidated validate function
export function validateRequest(
  bodySchema: z.ZodSchema<unknown>,
  paramsSchema?: z.ZodSchema<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Create a composed validation middleware that runs both validations
    const bodyValidation = validate('body', bodySchema, { replace: true });

    if (!paramsSchema) {
      // Only validate body if no params schema provided
      bodyValidation(req, res, next);
      return;
    }

    // Validate body first, then params if both schemas are provided
    const paramsValidation = validate('params', paramsSchema, { merge: true });

    bodyValidation(req, res, (bodyError) => {
      if (bodyError) {
        next(bodyError);
        return;
      }

      paramsValidation(req, res, next);
    });
  };
}

// Utility function to validate data in use cases
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
    }
    throw new Error('Invalid data format');
  }
}
