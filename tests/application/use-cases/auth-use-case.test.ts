import { AuthUseCase } from '../../../src/application/use-cases/auth-use-case';
import { DuplicateError, NotFoundError, ValidationError } from '../../../src/domain/errors/domain-errors';
import { mockAuthRepository, mockAuthService, createMockUser, testUserData } from '../../test-utils';

describe('AuthUseCase', () => {
  let useCase: AuthUseCase;
  let authRepository: jest.Mocked<any>;
  let authService: jest.Mocked<any>;

  beforeEach(() => {
    authRepository = mockAuthRepository();
    authService = mockAuthService();
    useCase = new AuthUseCase(authRepository, authService);
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      const mockUser = createMockUser({ email: 'test@example.com', password: 'hashedPassword' });
      const expectedToken = 'jwt-token';

      authRepository.findUserByEmail.mockResolvedValue(mockUser);
      authService.comparePassword.mockResolvedValue(true);
      authService.generateToken.mockReturnValue(expectedToken);

      const result = await useCase.login(loginData);

      expect(authRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(authService.comparePassword).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(authService.generateToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({
        token: expectedToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
      });
    });

    it('should throw ValidationError for non-existent user', async () => {
      const loginData = { email: 'nonexistent@example.com', password: 'password123' };

      authRepository.findUserByEmail.mockResolvedValue(null);

      await expect(useCase.login(loginData)).rejects.toThrow(ValidationError);
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(authService.comparePassword).not.toHaveBeenCalled();
      expect(authService.generateToken).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid password', async () => {
      const loginData = { email: 'test@example.com', password: 'wrongpassword' };
      const mockUser = createMockUser({ email: 'test@example.com', password: 'hashedPassword' });

      authRepository.findUserByEmail.mockResolvedValue(mockUser);
      authService.comparePassword.mockResolvedValue(false);

      await expect(useCase.login(loginData)).rejects.toThrow(ValidationError);
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(authService.comparePassword).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
      expect(authService.generateToken).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should register new user with valid data', async () => {
      const registerData = testUserData.valid;
      const hashedPassword = 'hashedPassword';
      const newUser = createMockUser({ ...registerData, password: hashedPassword });
      const expectedToken = 'jwt-token';

      authRepository.findUserByEmail.mockResolvedValue(null);
      authService.hashPassword.mockResolvedValue(hashedPassword);
      authRepository.createUser.mockResolvedValue(newUser);
      authService.generateToken.mockReturnValue(expectedToken);

      const result = await useCase.register(registerData);

      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(registerData.email);
      expect(authService.hashPassword).toHaveBeenCalledWith(registerData.password);
      expect(authRepository.createUser).toHaveBeenCalledWith(registerData.email, hashedPassword, registerData.role);
      expect(authService.generateToken).toHaveBeenCalledWith({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });
      expect(result).toEqual({
        token: expectedToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
        },
      });
    });

    it('should throw DuplicateError if user already exists', async () => {
      const registerData = testUserData.valid;
      const existingUser = createMockUser({ email: registerData.email });

      authRepository.findUserByEmail.mockResolvedValue(existingUser);

      await expect(useCase.register(registerData)).rejects.toThrow(DuplicateError);
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(registerData.email);
      expect(authService.hashPassword).not.toHaveBeenCalled();
      expect(authRepository.createUser).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user by ID', async () => {
      const userId = 1;
      const mockUser = createMockUser({ id: userId });

      authRepository.findUserById.mockResolvedValue(mockUser);

      const result = await useCase.getCurrentUser(userId);

      expect(authRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundError if user not found', async () => {
      const userId = 999;

      authRepository.findUserById.mockResolvedValue(null);

      await expect(useCase.getCurrentUser(userId)).rejects.toThrow(NotFoundError);
      expect(authRepository.findUserById).toHaveBeenCalledWith(userId);
    });
  });
});
