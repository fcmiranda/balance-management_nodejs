import type { Account as DomainAccount } from '@domain/entities/account';
import type { AccountRepository } from '@domain/repositories/account-repository';
import type { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Account } from '../database/entities/account.entity';
import { AccountMapper } from '../mappers/account-mapper';
import { BaseRepository } from './base-repository';

export class TypeOrmAccountRepository
  extends BaseRepository<DomainAccount, Account>
  implements AccountRepository
{
  protected repository: Repository<Account>;
  protected mapper: AccountMapper;

  constructor() {
    super();
    this.repository = AppDataSource.getRepository(Account);
    this.mapper = new AccountMapper();
  }

  async findAll(): Promise<DomainAccount[]> {
    return this.findAllEntities();
  }

  async findById(id: number): Promise<DomainAccount | null> {
    return this.findEntityById(id);
  }

  async findByUserId(userId: number): Promise<DomainAccount[]> {
    return this.findEntitiesByWhere({ userId } as any);
  }

  async findByAccountNumber(accountNumber: string): Promise<DomainAccount | null> {
    return this.findEntityByWhere({ accountNumber } as any);
  }

  async save(account: DomainAccount): Promise<DomainAccount> {
    return this.saveEntity(account);
  }

  async update(account: DomainAccount): Promise<DomainAccount> {
    if (!account.id) {
      throw new Error('Account ID is required for update');
    }
    return this.updateEntityById(account.id, account);
  }

  async delete(id: number): Promise<void> {
    return this.deleteEntityById(id);
  }
}
