import { CreateUserUseCase } from '@application/use-cases/create-user-use-case';
import { DeleteUserUseCase } from '@application/use-cases/delete-user-use-case';
import { GetUserByIdUseCase } from '@application/use-cases/get-user-by-id-use-case';
import { ListUsersUseCase } from '@application/use-cases/list-users-use-case';
import { UpdateUserUseCase } from '@application/use-cases/update-user-use-case';
import { Account } from '@domain/entities/account';
import type { User } from '@domain/entities/auth';
import {
  DuplicateError,
  InvalidOperationError,
  NotFoundError,
  ValidationError,
} from '@domain/errors/domain-errors';
import type { AccountRepository } from '@domain/repositories/account-repository';
import type { AuthRepository } from '@domain/repositories/auth-repository';
import type { AuthService } from '@infrastructure/auth/auth-service';

const mockAuthRepository = {
  findUserById: jest.fn(),
  findUserByEmail: jest.fn(),
  findAllUsers: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
} as jest.Mocked<AuthRepository>;

const mockAccountRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByAccountNumber: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as jest.Mocked<AccountRepository>;

const mockAuthService = {
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
  extractTokenFromHeader: jest.fn(),
  jwtSecret: 'test-secret',
  jwtExpiresIn: '1h',
  bcryptRounds: 10,
} as unknown as jest.Mocked<AuthService>;

const mockUser: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashedPassword',
  role: 'client',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('User Use Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GetUserByIdUseCase', () => {
    it('should return user when found', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      const useCase = new GetUserByIdUseCase(mockAuthRepository);

      const result = await useCase.execute({ id: 1 });

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(mockAuthRepository.findUserById).toHaveBeenCalledWith(1);
    });

    it('should return null when user not found', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(null);
      const useCase = new GetUserByIdUseCase(mockAuthRepository);

      const result = await useCase.execute({ id: 999 });

      expect(result).toBeNull();
      expect(mockAuthRepository.findUserById).toHaveBeenCalledWith(999);
    });
  });

  describe('ListUsersUseCase', () => {
    it('should return all users successfully', async () => {
      const users = [
        mockUser,
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: 'hashedPassword2',
          role: 'admin' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockAuthRepository.findAllUsers.mockResolvedValue(users);
      const useCase = new ListUsersUseCase(mockAuthRepository);

      const result = await useCase.execute();

      expect(result).toEqual([
        {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'admin',
          createdAt: users[1].createdAt,
          updatedAt: users[1].updatedAt,
        },
      ]);
      expect(mockAuthRepository.findAllUsers).toHaveBeenCalledWith();
    });

    it('should return empty array when no users exist', async () => {
      mockAuthRepository.findAllUsers.mockResolvedValue([]);
      const useCase = new ListUsersUseCase(mockAuthRepository);

      const result = await useCase.execute();

      expect(result).toEqual([]);
      expect(mockAuthRepository.findAllUsers).toHaveBeenCalledWith();
    });
  });

  describe('CreateUserUseCase', () => {
    it('should create user successfully', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(null);
      mockAuthService.hashPassword.mockResolvedValue('hashedPassword');
      mockAuthRepository.createUser.mockResolvedValue(mockUser);
      const useCase = new CreateUserUseCase(mockAuthRepository, mockAuthService);

      const result = await useCase.execute({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'client',
      });

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(mockAuthService.hashPassword).toHaveBeenCalledWith('password123');
      expect(mockAuthRepository.createUser).toHaveBeenCalledWith(
        'John Doe',
        'john@example.com',
        'hashedPassword',
        'client',
      );
    });

    it('should throw ValidationError for invalid name', async () => {
      const useCase = new CreateUserUseCase(mockAuthRepository, mockAuthService);

      await expect(
        useCase.execute({
          name: 'J',
          email: 'john@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid email', async () => {
      const useCase = new CreateUserUseCase(mockAuthRepository, mockAuthService);

      await expect(
        useCase.execute({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'password123',
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for short password', async () => {
      const useCase = new CreateUserUseCase(mockAuthRepository, mockAuthService);

      await expect(
        useCase.execute({
          name: 'John Doe',
          email: 'john@example.com',
          password: '123',
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw DuplicateError when user already exists', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
      const useCase = new CreateUserUseCase(mockAuthRepository, mockAuthService);

      await expect(
        useCase.execute({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(DuplicateError);
    });
  });

  describe('UpdateUserUseCase', () => {
    it('should update user successfully', async () => {
      const updatedUser = { ...mockUser, name: 'John Updated' };
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      mockAuthRepository.updateUser.mockResolvedValue(updatedUser);
      const useCase = new UpdateUserUseCase(mockAuthRepository, mockAuthService);

      const result = await useCase.execute({
        id: 1,
        name: 'John Updated',
      });

      expect(result.name).toBe('John Updated');
      expect(mockAuthRepository.updateUser).toHaveBeenCalledWith(1, { name: 'John Updated' });
    });

    it('should throw NotFoundError when user does not exist', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(null);
      const useCase = new UpdateUserUseCase(mockAuthRepository, mockAuthService);

      await expect(
        useCase.execute({
          id: 999,
          name: 'John Updated',
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw DuplicateError when email already exists', async () => {
      const anotherUser = { ...mockUser, id: 2 };
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      mockAuthRepository.findUserByEmail.mockResolvedValue(anotherUser);
      const useCase = new UpdateUserUseCase(mockAuthRepository, mockAuthService);

      await expect(
        useCase.execute({
          id: 1,
          email: 'existing@example.com',
        }),
      ).rejects.toThrow(DuplicateError);
    });
  });

  describe('DeleteUserUseCase', () => {
    it('should delete user successfully when no active accounts', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      mockAccountRepository.findByUserId.mockResolvedValue([]);
      const useCase = new DeleteUserUseCase(mockAuthRepository, mockAccountRepository);

      await useCase.execute({ id: 1 });

      expect(mockAuthRepository.deleteUser).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(null);
      const useCase = new DeleteUserUseCase(mockAuthRepository, mockAccountRepository);

      await expect(useCase.execute({ id: 999 })).rejects.toThrow(NotFoundError);
    });

    it('should allow deletion when user has accounts with zero balance', async () => {
      const accountWithZeroBalance = Account.create(1, '1234567890');
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      mockAccountRepository.findByUserId.mockResolvedValue([accountWithZeroBalance]);
      const useCase = new DeleteUserUseCase(mockAuthRepository, mockAccountRepository);

      await useCase.execute({ id: 1 });

      expect(mockAuthRepository.deleteUser).toHaveBeenCalledWith(1);
    });

    it('should throw InvalidOperationError when user has accounts with positive balance', async () => {
      const accountWithBalance = Account.create(1, '1234567890');
      accountWithBalance.deposit(100);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      mockAccountRepository.findByUserId.mockResolvedValue([accountWithBalance]);
      const useCase = new DeleteUserUseCase(mockAuthRepository, mockAccountRepository);

      await expect(useCase.execute({ id: 1 })).rejects.toThrow(InvalidOperationError);
    });
  });
});
