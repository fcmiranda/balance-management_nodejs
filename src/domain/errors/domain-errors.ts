export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(
    message: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';

  constructor(
    message: string,
    public readonly validationErrors: string[],
  ) {
    super(message, { validationErrors });
  }
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';

  constructor(resource: string, id: string | number) {
    super(`${resource} with id ${id} not found`);
  }
}

export class DuplicateError extends DomainError {
  readonly code = 'DUPLICATE_ERROR';

  constructor(resource: string, field: string, value: string) {
    super(`${resource} with ${field} '${value}' already exists`);
  }
}

export class InsufficientFundsError extends DomainError {
  readonly code = 'INSUFFICIENT_FUNDS';

  constructor(requestedAmount: number, availableBalance: number) {
    super(`Insufficient funds. Requested: ${requestedAmount}, Available: ${availableBalance}`);
  }
}

export class InvalidOperationError extends DomainError {
  readonly code = 'INVALID_OPERATION';

  constructor(operation: string, reason: string) {
    super(`Invalid operation '${operation}': ${reason}`);
  }
}
