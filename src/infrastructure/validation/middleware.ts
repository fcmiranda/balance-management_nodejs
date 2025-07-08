import type { NextFunction, Request, Response } from 'express';
import { ZodError, type z } from 'zod';
import type { StandardErrorResponse } from '../middleware/standard-error-handler';

type ValidationTarget = 'body' | 'params' | 'query' | 'headers';

const ERROR_MESSAGES: Record<ValidationTarget, string> = {
  body: 'Invalid request body',
  params: 'Invalid URL parameters',
  query: 'Invalid query parameters',
  headers: 'Invalid request headers',
};

const VALIDATION_CONTEXTS: Record<ValidationTarget, string> = {
  body: 'Validation failed',
  params: 'Invalid URL parameters',
  query: 'Invalid query parameters',
  headers: 'Invalid request headers',
};

function handleValidationError(
  error: unknown,
  req: Request,
  res: Response,
  target: ValidationTarget,
): void {
  const timestamp = new Date().toISOString();
  const path = req.originalUrl || req.path;

  if (error instanceof ZodError) {
    const errorMessages = error.errors.map((err) => {
      const pathStr = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
      return `${pathStr}${err.message}`;
    });

    const response: StandardErrorResponse = {
      error: VALIDATION_CONTEXTS[target],
      message: 'Request validation failed',
      details: errorMessages,
      timestamp,
      path,
    };
    res.status(400).json(response);
    return;
  }

  const response: StandardErrorResponse = {
    error: ERROR_MESSAGES[target],
    message: 'Validation error occurred',
    timestamp,
    path,
  };
  res.status(400).json(response);
}

export function validate(
  target: ValidationTarget,
  schema: z.ZodSchema<unknown>,
  options: {
    merge?: boolean;
    replace?: boolean;
  } = {},
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[target];
      const validatedData = schema.parse(data);

      const shouldReplace = options.replace ?? target === 'body';
      const shouldMerge = options.merge ?? !shouldReplace;

      if (shouldReplace) {
        (req as any)[target] = validatedData;
      } else if (shouldMerge) {
        Object.assign(req[target], validatedData);
      }

      next();
    } catch (error) {
      handleValidationError(error, req, res, target);
    }
  };
}

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

export function validateRequest(
  bodySchema: z.ZodSchema<unknown>,
  paramsSchema?: z.ZodSchema<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const bodyValidation = validate('body', bodySchema, { replace: true });

    if (!paramsSchema) {
      bodyValidation(req, res, next);
      return;
    }

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
