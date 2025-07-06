import type { NextFunction, Request, Response } from 'express';
import { ZodError, type z } from 'zod';

// Validation error response interface
interface ValidationErrorResponse {
  error: string;
  details?: string[];
}

// Generic validation middleware factory
export function validateSchema(schema: z.ZodSchema<unknown>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
        const response: ValidationErrorResponse = {
          error: 'Validation failed',
          details: errorMessages,
        };
        res.status(400).json(response);
        return;
      }
      // Handle other errors
      const response: ValidationErrorResponse = {
        error: 'Invalid request data',
      };
      res.status(400).json(response);
    }
  };
}

// Validate URL parameters
export function validateParams(schema: z.ZodSchema<unknown>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedParams = schema.parse(req.params);
      // Merge validated params back to req.params
      Object.assign(req.params, validatedParams);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
        const response: ValidationErrorResponse = {
          error: 'Invalid URL parameters',
          details: errorMessages,
        };
        res.status(400).json(response);
        return;
      }
      const response: ValidationErrorResponse = {
        error: 'Invalid URL parameters',
      };
      res.status(400).json(response);
    }
  };
}

// Validate query parameters
export function validateQuery(schema: z.ZodSchema<unknown>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedQuery = schema.parse(req.query);
      // Merge validated query back to req.query
      Object.assign(req.query, validatedQuery);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
        const response: ValidationErrorResponse = {
          error: 'Invalid query parameters',
          details: errorMessages,
        };
        res.status(400).json(response);
        return;
      }
      const response: ValidationErrorResponse = {
        error: 'Invalid query parameters',
      };
      res.status(400).json(response);
    }
  };
}

// Validate request body with custom error handling
export function validateBody(schema: z.ZodSchema<unknown>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedBody = schema.parse(req.body);
      // Replace req.body with validated and possibly transformed data
      req.body = validatedBody;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => {
          const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
          return `${path}${err.message}`;
        });
        const response: ValidationErrorResponse = {
          error: 'Validation failed',
          details: errorMessages,
        };
        res.status(400).json(response);
        return;
      }
      const response: ValidationErrorResponse = {
        error: 'Invalid request body',
      };
      res.status(400).json(response);
    }
  };
}

// Combine body and params validation
export function validateRequest(
  bodySchema: z.ZodSchema<unknown>,
  paramsSchema?: z.ZodSchema<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate body
      const validatedBody = bodySchema.parse(req.body);
      req.body = validatedBody;

      // Validate params if schema provided
      if (paramsSchema) {
        const validatedParams = paramsSchema.parse(req.params);
        Object.assign(req.params, validatedParams);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => {
          const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
          return `${path}${err.message}`;
        });
        const response: ValidationErrorResponse = {
          error: 'Validation failed',
          details: errorMessages,
        };
        res.status(400).json(response);
        return;
      }
      const response: ValidationErrorResponse = {
        error: 'Invalid request data',
      };
      res.status(400).json(response);
    }
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
