import { CreateAccountUseCase } from '../../../src/application/use-cases/create-account-use-case';
import { Account } from '../../../src/domain/entities/account';
import type { User } from '../../../src/domain/entities/auth';
import { NotFoundError } from '../../../src/domain/errors/domain-errors';
import type { AccountRepository } from '../../../src/domain/repositories/account-repository';
import type { AuthRepository } from '../../../src/domain/repositories/auth-repository';

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
  findAllUsers: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
} as jest.Mocked<AuthRepository>;

describe('CreateAccountUseCase', () => {
  let useCase: CreateAccountUseCase;
  const mockDate = new Date('2025-07-08T10:00:00.000Z');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
    useCase = new CreateAccountUseCase(mockAccountRepository, mockAuthRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should create account with valid number format', async () => {
      const userId = 123;
      const mockUser: User = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hash',
        role: 'client',
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      mockAccountRepository.save.mockImplementation((account) =>
        Promise.resolve(
          Account.fromPersistence(
            1,
            account.userId,
            account.accountNumber,
            account.balance,
            mockDate,
          ),
        ),
      );

      const result = await useCase.execute({ userId });

      // Validar formato do número da conta
      expect(result.accountNumber).toMatch(/^[1-9]\d{9}$/);
      expect(result.accountNumber).toHaveLength(10);

      // Validar que contém o componente do usuário (23 de 123)
      expect(result.accountNumber.substring(1, 3)).toBe('23');

      // Validar que o primeiro dígito não é zero
      expect(result.accountNumber[0]).not.toBe('0');
    });

    it('should generate different account numbers for same user in different timestamps', async () => {
      const userId = 123;
      const mockUser: User = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hash',
        role: 'client',
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const firstDate = new Date('2025-07-08T10:00:00.000Z');
      const secondDate = new Date('2025-07-08T10:00:01.000Z');

      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      // Primeira criação de conta
      jest.spyOn(Date, 'now').mockImplementation(() => firstDate.getTime());
      mockAccountRepository.save.mockImplementation((account) =>
        Promise.resolve(
          Account.fromPersistence(
            1,
            account.userId,
            account.accountNumber,
            account.balance,
            firstDate,
          ),
        ),
      );
      const firstResult = await useCase.execute({ userId });

      // Segunda criação de conta
      jest.spyOn(Date, 'now').mockImplementation(() => secondDate.getTime());
      mockAccountRepository.save.mockImplementation((account) =>
        Promise.resolve(
          Account.fromPersistence(
            2,
            account.userId,
            account.accountNumber,
            account.balance,
            secondDate,
          ),
        ),
      );
      const secondResult = await useCase.execute({ userId });

      expect(firstResult.accountNumber).not.toBe(secondResult.accountNumber);
      // Ambos devem ter o mesmo componente de usuário
      expect(firstResult.accountNumber.substring(1, 3)).toBe('23');
      expect(secondResult.accountNumber.substring(1, 3)).toBe('23');
    });

    it('should generate different account numbers for different users', async () => {
      const firstUserId = 123;
      const secondUserId = 456;
      const firstUser: User = {
        id: firstUserId,
        name: 'First User',
        email: 'first@example.com',
        password: 'hash',
        role: 'client',
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const secondUser: User = {
        id: secondUserId,
        name: 'Second User',
        email: 'second@example.com',
        password: 'hash',
        role: 'client',
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      // Primeira conta
      mockAuthRepository.findUserById.mockResolvedValueOnce(firstUser);
      mockAccountRepository.save.mockImplementation((account) =>
        Promise.resolve(
          Account.fromPersistence(
            1,
            account.userId,
            account.accountNumber,
            account.balance,
            mockDate,
          ),
        ),
      );
      const firstResult = await useCase.execute({ userId: firstUserId });

      // Segunda conta
      mockAuthRepository.findUserById.mockResolvedValueOnce(secondUser);
      const secondResult = await useCase.execute({ userId: secondUserId });

      expect(firstResult.accountNumber).not.toBe(secondResult.accountNumber);
      // Validar diferentes componentes de usuário
      expect(firstResult.accountNumber.substring(1, 3)).toBe('23'); // 123 % 100
      expect(secondResult.accountNumber.substring(1, 3)).toBe('56'); // 456 % 100
    });

    it('should throw NotFoundError when user does not exist', async () => {
      const userId = 999;
      mockAuthRepository.findUserById.mockResolvedValue(null);

      await expect(useCase.execute({ userId })).rejects.toThrow(new NotFoundError('User', userId));

      expect(mockAccountRepository.save).not.toHaveBeenCalled();
    });
  });
});
