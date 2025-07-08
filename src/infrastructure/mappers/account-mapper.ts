import { Account as DomainAccount } from '@domain/entities/account';
import type { Account as DatabaseAccount } from '../database/entities/account.entity';
import { EntityMapper } from './base-mapper';

/**
 * Account Entity Mapper
 * Handles mapping between domain Account and database Account entities
 */
export class AccountMapper extends EntityMapper<DomainAccount, DatabaseAccount> {
  /**
   * Maps a database Account entity to a domain Account entity
   */
  toDomain(entity: DatabaseAccount): DomainAccount {
    return DomainAccount.fromPersistence(
      entity.id,
      entity.userId,
      entity.accountNumber,
      Number(entity.balance), // Ensure proper type conversion from decimal
      entity.createdAt,
    );
  }

  /**
   * Maps a domain Account entity to a database Account entity for creation
   */
  toEntity(domain: DomainAccount): Partial<DatabaseAccount> {
    return {
      userId: domain.userId,
      accountNumber: domain.accountNumber,
      balance: domain.balance,
    };
  }

  /**
   * Maps a domain Account entity to a database Account entity for updates
   */
  toEntityForUpdate(domain: DomainAccount): Partial<DatabaseAccount> {
    return {
      userId: domain.userId,
      accountNumber: domain.accountNumber,
      balance: domain.balance,
    };
  }
}
