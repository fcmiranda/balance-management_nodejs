import { CreateAccountUseCase } from '@application/use-cases/create-account-use-case';
import { Account } from '@domain/entities/account';
import type { User } from '@domain/entities/auth';
import { NotFoundError } from '@domain/errors/domain-errors';
import type { AccountRepository } from '@domain/repositories/account-repository';
import type { AuthRepository } from '@domain/repositories/auth-repository';

// Mock repositories
const mockAccountRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByAccountNumber: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as jest.Mocked<AccountRepository>;

const mockAuthRepository = {
  findUserById: jest.fn(),
  findUserByEmail: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
} as jest.Mocked<AuthRepository>;

const mockUser: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashedPassword',
  role: 'client',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CreateAccountUseCase', () => {
  let useCase: CreateAccountUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateAccountUseCase(mockAccountRepository, mockAuthRepository);
  });

  describe('execute', () => {
    it('should create account successfully', async () => {
      const request = {
        userId: 1,
        name: 'John Doe',
        accountType: 'savings' as const,
      };

      const savedAccount = Account.fromPersistence(1, 1, '1234567890', 0, 'savings', 'active');

      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      mockAccountRepository.findByAccountNumber.mockResolvedValue(null);
      mockAccountRepository.save.mockResolvedValue(savedAccount);

      const result = await useCase.execute(request);

      expect(mockAuthRepository.findUserById).toHaveBeenCalledWith(1);
      expect(mockAccountRepository.findByAccountNumber).toHaveBeenCalled();
      expect(mockAccountRepository.save).toHaveBeenCalledWith(expect.any(Account));
      expect(result).toEqual({
        id: 1,
        userId: 1,
        accountNumber: '1234567890',
        balance: 0,
        accountType: 'savings',
        status: 'active',
      });
    });

    it('should create checking account successfully', async () => {
      const request = {
        userId: 1,
        name: 'John Doe',
        accountType: 'checking' as const,
      };

      const savedAccount = Account.fromPersistence(2, 1, '0987654321', 0, 'checking', 'active');

      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      mockAccountRepository.findByAccountNumber.mockResolvedValue(null);
      mockAccountRepository.save.mockResolvedValue(savedAccount);

      const result = await useCase.execute(request);

      expect(result.accountType).toBe('checking');
      expect(result.userId).toBe(1);
      expect(result.balance).toBe(0);
      expect(result.status).toBe('active');
    });

    it('should throw NotFoundError when user does not exist', async () => {
      const request = {
        userId: 999,
        name: 'John Doe',
        accountType: 'savings' as const,
      };

      mockAuthRepository.findUserById.mockResolvedValue(null);

      await expect(useCase.execute(request)).rejects.toThrow(NotFoundError);
      expect(mockAuthRepository.findUserById).toHaveBeenCalledWith(999);
      expect(mockAccountRepository.save).not.toHaveBeenCalled();
    });

    it('should generate unique account number when first attempt conflicts', async () => {
      const request = {
        userId: 1,
        name: 'John Doe',
        accountType: 'savings' as const,
      };

      const existingAccount = Account.fromPersistence(
        1,
        2,
        '1234567890',
        100,
        'checking',
        'active',
      );

      const savedAccount = Account.fromPersistence(2, 1, '0987654321', 0, 'savings', 'active');

      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      mockAccountRepository.findByAccountNumber
        .mockResolvedValueOnce(existingAccount) // First attempt returns existing account
        .mockResolvedValueOnce(null); // Second attempt returns null (unique)
      mockAccountRepository.save.mockResolvedValue(savedAccount);

      const result = await useCase.execute(request);

      expect(mockAccountRepository.findByAccountNumber).toHaveBeenCalledTimes(2);
      expect(result.accountNumber).toBe('0987654321');
    });

    it('should throw error when unable to generate unique account number', async () => {
      const request = {
        userId: 1,
        name: 'John Doe',
        accountType: 'savings' as const,
      };

      const existingAccount = Account.fromPersistence(
        1,
        2,
        '1234567890',
        100,
        'checking',
        'active',
      );

      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      // Mock all attempts to return existing account (simulating collision)
      mockAccountRepository.findByAccountNumber.mockResolvedValue(existingAccount);

      await expect(useCase.execute(request)).rejects.toThrow(
        'Unable to generate unique account number after multiple attempts',
      );
      expect(mockAccountRepository.findByAccountNumber).toHaveBeenCalledTimes(10); // max attempts
      expect(mockAccountRepository.save).not.toHaveBeenCalled();
    });

    it('should generate 10-digit account number', async () => {
      const request = {
        userId: 1,
        name: 'John Doe',
        accountType: 'savings' as const,
      };

      const savedAccount = Account.fromPersistence(1, 1, '1234567890', 0, 'savings', 'active');

      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      mockAccountRepository.findByAccountNumber.mockResolvedValue(null);
      mockAccountRepository.save.mockResolvedValue(savedAccount);

      await useCase.execute(request);

      const saveCall = mockAccountRepository.save.mock.calls[0][0];
      expect(saveCall.accountNumber).toMatch(/^\d{10}$/); // 10 digits
      expect(saveCall.accountNumber[0]).not.toBe('0'); // First digit not zero
    });
  });
});
