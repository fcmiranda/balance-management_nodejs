import type { Account as DatabaseAccount } from '../../../src/infrastructure/database/entities/account.entity';
import type { User as DatabaseUser } from '../../../src/infrastructure/database/entities/user.entity';
import { AccountMapper } from '../../../src/infrastructure/mappers/account-mapper';
import { UserMapper } from '../../../src/infrastructure/mappers/user-mapper';

describe('Entity Mappers', () => {
  describe('AccountMapper', () => {
    const accountMapper = new AccountMapper();

    it('should map database account to domain account', () => {
      const dbAccount = {
        id: 1,
        userId: 123,
        accountNumber: '1234567890',
        balance: 100.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as DatabaseAccount;

      const domainAccount = accountMapper.toDomain(dbAccount);

      expect(domainAccount.id).toBe(1);
      expect(domainAccount.userId).toBe(123);
      expect(domainAccount.accountNumber).toBe('1234567890');
      expect(domainAccount.balance).toBe(100.5);
    });
  });

  describe('UserMapper', () => {
    const userMapper = new UserMapper();

    it('should map database user to domain user', () => {
      const dbUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
        role: 'client' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as DatabaseUser;

      const domainUser = userMapper.toDomain(dbUser);

      expect(domainUser.id).toBe(1);
      expect(domainUser.name).toBe('John Doe');
      expect(domainUser.email).toBe('john@example.com');
      expect(domainUser.role).toBe('client');
    });
  });
});
