import { GetAccountsByUserIdUseCase } from '@application/use-cases/get-accounts-by-user-id-use-case';
import { Account } from '@domain/entities/account';
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

describe('GetAccountsByUserIdUseCase', () => {
  let useCase: GetAccountsByUserIdUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetAccountsByUserIdUseCase(mockAccountRepository);
  });

  describe('execute', () => {
    it('should return accounts with createdAt field', async () => {
      const currentDate = new Date();
      const mockAccounts = [
        Account.fromPersistence(1, 1, '1234567890', 100.5, currentDate),
        Account.fromPersistence(2, 1, '0987654321', 250.75, currentDate),
      ];

      mockAccountRepository.findByUserId.mockResolvedValue(mockAccounts);

      const result = await useCase.execute({ userId: 1 });

      expect(result).toEqual([
        {
          id: 1,
          userId: 1,
          accountNumber: '1234567890',
          balance: 100.5,
          createdAt: currentDate,
        },
        {
          id: 2,
          userId: 1,
          accountNumber: '0987654321',
          balance: 250.75,
          createdAt: currentDate,
        },
      ]);
      expect(mockAccountRepository.findByUserId).toHaveBeenCalledWith(1);
    });

    it('should return empty array when user has no accounts', async () => {
      mockAccountRepository.findByUserId.mockResolvedValue([]);

      const result = await useCase.execute({ userId: 1 });

      expect(result).toEqual([]);
      expect(mockAccountRepository.findByUserId).toHaveBeenCalledWith(1);
    });

    it('should handle accounts without createdAt field', async () => {
      const mockAccounts = [
        Account.fromPersistence(1, 1, '1234567890', 100.5), // No createdAt
      ];

      mockAccountRepository.findByUserId.mockResolvedValue(mockAccounts);

      const result = await useCase.execute({ userId: 1 });

      expect(result).toEqual([
        {
          id: 1,
          userId: 1,
          accountNumber: '1234567890',
          balance: 100.5,
          createdAt: undefined,
        },
      ]);
    });
  });
});
