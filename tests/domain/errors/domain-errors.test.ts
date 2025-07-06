import {
  DomainError,
  DuplicateError,
  InsufficientFundsError,
  InvalidOperationError,
  NotFoundError,
  ValidationError,
} from '../../../src/domain/errors/domain-errors';

describe('Domain Errors', () => {
  describe('DomainError', () => {
    it('should create domain error with message', () => {
      class TestError extends DomainError {
        readonly code = 'TEST_ERROR';
      }

      const error = new TestError('Test domain error');

      expect(error.message).toBe('Test domain error');
      expect(error.name).toBe('TestError');
      expect(error.code).toBe('TEST_ERROR');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with message and details', () => {
      const validationErrors = ['Name is required', 'Email is invalid'];
      const error = new ValidationError('Validation failed', validationErrors);

      expect(error.message).toBe('Validation failed');
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.validationErrors).toEqual(validationErrors);
      expect(error).toBeInstanceOf(DomainError);
    });

    it('should create validation error with empty details', () => {
      const error = new ValidationError('Validation failed', []);

      expect(error.message).toBe('Validation failed');
      expect(error.validationErrors).toEqual([]);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with entity and id', () => {
      const error = new NotFoundError('Client', 123);

      expect(error.message).toBe('Client with id 123 not found');
      expect(error.name).toBe('NotFoundError');
      expect(error.code).toBe('NOT_FOUND');
      expect(error).toBeInstanceOf(DomainError);
    });

    it('should create not found error with string id', () => {
      const error = new NotFoundError('User', 'abc123');

      expect(error.message).toBe('User with id abc123 not found');
    });
  });

  describe('DuplicateError', () => {
    it('should create duplicate error with entity, field and value', () => {
      const error = new DuplicateError('Client', 'email', 'test@example.com');

      expect(error.message).toBe("Client with email 'test@example.com' already exists");
      expect(error.name).toBe('DuplicateError');
      expect(error.code).toBe('DUPLICATE_ERROR');
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('InsufficientFundsError', () => {
    it('should create insufficient funds error with amounts', () => {
      const error = new InsufficientFundsError(1000, 500);

      expect(error.message).toBe('Insufficient funds. Requested: 1000, Available: 500');
      expect(error.name).toBe('InsufficientFundsError');
      expect(error.code).toBe('INSUFFICIENT_FUNDS');
      expect(error).toBeInstanceOf(DomainError);
    });

    it('should create insufficient funds error with zero available balance', () => {
      const error = new InsufficientFundsError(100, 0);

      expect(error.message).toBe('Insufficient funds. Requested: 100, Available: 0');
    });
  });

  describe('InvalidOperationError', () => {
    it('should create invalid operation error', () => {
      const error = new InvalidOperationError('withdraw', 'account is frozen');

      expect(error.message).toBe("Invalid operation 'withdraw': account is frozen");
      expect(error.name).toBe('InvalidOperationError');
      expect(error.code).toBe('INVALID_OPERATION');
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('Error inheritance', () => {
    it('should maintain proper error chain', () => {
      const validationError = new ValidationError('Test', []);
      const notFoundError = new NotFoundError('Test', 1);
      const duplicateError = new DuplicateError('Test', 'field', 'value');
      const insufficientFundsError = new InsufficientFundsError(100, 50);

      expect(validationError).toBeInstanceOf(Error);
      expect(validationError).toBeInstanceOf(DomainError);
      expect(validationError).toBeInstanceOf(ValidationError);

      expect(notFoundError).toBeInstanceOf(Error);
      expect(notFoundError).toBeInstanceOf(DomainError);
      expect(notFoundError).toBeInstanceOf(NotFoundError);

      expect(duplicateError).toBeInstanceOf(Error);
      expect(duplicateError).toBeInstanceOf(DomainError);
      expect(duplicateError).toBeInstanceOf(DuplicateError);

      expect(insufficientFundsError).toBeInstanceOf(Error);
      expect(insufficientFundsError).toBeInstanceOf(DomainError);
      expect(insufficientFundsError).toBeInstanceOf(InsufficientFundsError);
    });
  });
});
