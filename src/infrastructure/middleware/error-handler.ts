import type { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../domain/errors/domain-errors';

export class ErrorHandlerMiddleware {
  static handle(error: Error, req: Request, res: Response, next: NextFunction): void {
    if (error instanceof DomainError) {
      ErrorHandlerMiddleware.handleDomainError(error, res);
    } else {
      ErrorHandlerMiddleware.handleGenericError(error, res);
    }
  }

  private static handleDomainError(error: DomainError, res: Response): void {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        res.status(400).json({
          error: 'Validation failed',
          message: error.message,
          details: error.details,
        });
        break;

      case 'NOT_FOUND':
        res.status(404).json({
          error: 'Resource not found',
          message: error.message,
        });
        break;

      case 'DUPLICATE_ERROR':
        res.status(409).json({
          error: 'Duplicate resource',
          message: error.message,
        });
        break;

      case 'INSUFFICIENT_FUNDS':
        res.status(400).json({
          error: 'Insufficient funds',
          message: error.message,
        });
        break;

      case 'INVALID_OPERATION':
        res.status(400).json({
          error: 'Invalid operation',
          message: error.message,
        });
        break;

      default:
        res.status(500).json({
          error: 'Internal server error',
          message: 'An unexpected error occurred',
        });
    }
  }

  private static handleGenericError(error: Error, res: Response): void {
    console.error('Unhandled error:', error);

    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
    });
  }
}
