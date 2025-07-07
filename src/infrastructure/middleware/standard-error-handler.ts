import { DomainError } from '@domain/errors/domain-errors';
import type { Request, Response } from 'express';

/**
 * Standard API error response format
 */
export interface StandardErrorResponse {
  error: string;
  message: string;
  details?: unknown;
  timestamp: string;
  path: string;
}

/**
 * Standard API success response wrapper
 */
export interface StandardSuccessResponse<T = unknown> {
  success: true;
  data: T;
  timestamp: string;
}

/**
 * HTTP status code mapping for domain errors
 */
const ERROR_STATUS_MAP: Record<string, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  DUPLICATE_ERROR: 409,
  UNAUTHORIZED: 401,
  INSUFFICIENT_FUNDS: 400,
  INVALID_OPERATION: 400,
};

/**
 * Error type mapping for domain errors
 */
const ERROR_TYPE_MAP: Record<string, string> = {
  VALIDATION_ERROR: 'Validation failed',
  NOT_FOUND: 'Resource not found',
  DUPLICATE_ERROR: 'Duplicate resource',
  UNAUTHORIZED: 'Unauthorized',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  INVALID_OPERATION: 'Invalid operation',
};

/**
 * Handle errors and send standardized response
 */
export function handleError(error: unknown, req: Request, res: Response): void {
  const timestamp = new Date().toISOString();
  const path = req.originalUrl || req.path;

  if (error instanceof DomainError) {
    const statusCode = ERROR_STATUS_MAP[error.code] || 500;
    const errorType = ERROR_TYPE_MAP[error.code] || 'Internal server error';

    const errorResponse: StandardErrorResponse = {
      error: errorType,
      message: error.message,
      details: error.details,
      timestamp,
      path,
    };

    res.status(statusCode).json(errorResponse);
    return;
  }

  // Handle generic errors
  console.error('Unhandled error:', error);

  const errorResponse: StandardErrorResponse = {
    error: 'Internal server error',
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    timestamp,
    path,
  };

  res.status(500).json(errorResponse);
}

/**
 * Handle authentication errors
 */
export function handleAuthError(message: string, req: Request, res: Response): void {
  const errorResponse: StandardErrorResponse = {
    error: 'Authentication required',
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl || req.path,
  };

  res.status(401).json(errorResponse);
}

/**
 * Handle authorization errors
 */
export function handleAuthorizationError(message: string, req: Request, res: Response): void {
  const errorResponse: StandardErrorResponse = {
    error: 'Access denied',
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl || req.path,
  };

  res.status(403).json(errorResponse);
}

/**
 * Handle validation errors
 */
export function handleValidationError(
  message: string,
  details: unknown,
  req: Request,
  res: Response,
): void {
  const errorResponse: StandardErrorResponse = {
    error: 'Validation failed',
    message,
    details,
    timestamp: new Date().toISOString(),
    path: req.originalUrl || req.path,
  };

  res.status(400).json(errorResponse);
}

/**
 * Send standardized success response
 */
export function sendSuccess<T>(data: T, res: Response, statusCode = 200): void {
  const successResponse: StandardSuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(successResponse);
}

/**
 * Send standardized success response with just data (for backward compatibility)
 */
export function sendData<T>(data: T, res: Response, statusCode = 200): void {
  res.status(statusCode).json(data);
}

/**
 * Express middleware for global error handling
 */
export const globalErrorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: unknown,
): void => {
  handleError(error, req, res);
};
