import { DeleteAccountUseCase } from '@application/use-cases/delete-account-use-case';
import { Account } from '@domain/entities/account';
import {
  InvalidOperationError,
  NotFoundError,
  UnauthorizedError,
} from '@domain/errors/domain-errors';
import type { AccountRepository } from '@domain/repositories/account-repository';

const mockAccountRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByAccountNumber: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as jest.Mocked<AccountRepository>;

describe('DeleteAccountUseCase', () => {
  let useCase: DeleteAccountUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteAccountUseCase(mockAccountRepository);
  });

  describe('execute', () => {
    it('should delete account with zero balance successfully', async () => {
      const accountId = 1;
      const userId = 1;
      const mockAccount = Account.fromPersistence(accountId, userId, '1234567890', 0);

      mockAccountRepository.findById.mockResolvedValue(mockAccount);
      mockAccountRepository.delete.mockResolvedValue();

      await useCase.execute({ accountId, userId });

      expect(mockAccountRepository.findById).toHaveBeenCalledWith(accountId);
      expect(mockAccountRepository.delete).toHaveBeenCalledWith(accountId);
    });

    it('should throw NotFoundError when account does not exist', async () => {
      const accountId = 999;
      const userId = 1;

      mockAccountRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute({ accountId, userId })).rejects.toThrow(
        new NotFoundError('Account', accountId),
      );

      expect(mockAccountRepository.findById).toHaveBeenCalledWith(accountId);
      expect(mockAccountRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError when user is not the owner', async () => {
      const accountId = 1;
      const accountOwnerId = 1;
      const requestUserId = 2;
      const mockAccount = Account.fromPersistence(accountId, accountOwnerId, '1234567890', 0);

      mockAccountRepository.findById.mockResolvedValue(mockAccount);

      await expect(useCase.execute({ accountId, userId: requestUserId })).rejects.toThrow(
        new UnauthorizedError('You can only delete your own account'),
      );

      expect(mockAccountRepository.findById).toHaveBeenCalledWith(accountId);
      expect(mockAccountRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw InvalidOperationError when account has positive balance', async () => {
      const accountId = 1;
      const userId = 1;
      const mockAccount = Account.fromPersistence(accountId, userId, '1234567890', 100.5);

      mockAccountRepository.findById.mockResolvedValue(mockAccount);

      await expect(useCase.execute({ accountId, userId })).rejects.toThrow(
        new InvalidOperationError(
          'delete account',
          'Account has a positive balance. Please withdraw all funds before deleting the account.',
        ),
      );

      expect(mockAccountRepository.findById).toHaveBeenCalledWith(accountId);
      expect(mockAccountRepository.delete).not.toHaveBeenCalled();
    });
  });
});
