import { Account as DomainAccount } from '@domain/entities/account';
import type { AccountRepository } from '@domain/repositories/account-repository';
import type { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Account } from '../database/entities/account.entity';

export class TypeOrmAccountRepository implements AccountRepository {
  private repository: Repository<Account>;

  constructor() {
    this.repository = AppDataSource.getRepository(Account);
  }

  async findAll(): Promise<DomainAccount[]> {
    const entities = await this.repository.find();
    return entities.map((entity) =>
      DomainAccount.fromPersistence(
        entity.id,
        entity.userId,
        entity.accountNumber,
        Number(entity.balance),
      ),
    );
  }

  async findById(id: number): Promise<DomainAccount | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;

    return DomainAccount.fromPersistence(
      entity.id,
      entity.userId,
      entity.accountNumber,
      Number(entity.balance),
    );
  }

  async findByUserId(userId: number): Promise<DomainAccount[]> {
    const entities = await this.repository.find({ where: { userId } });
    return entities.map((entity) =>
      DomainAccount.fromPersistence(
        entity.id,
        entity.userId,
        entity.accountNumber,
        Number(entity.balance),
      ),
    );
  }

  async findByAccountNumber(accountNumber: string): Promise<DomainAccount | null> {
    const entity = await this.repository.findOne({ where: { accountNumber } });
    if (!entity) return null;

    return DomainAccount.fromPersistence(
      entity.id,
      entity.userId,
      entity.accountNumber,
      Number(entity.balance),
    );
  }

  async save(account: DomainAccount): Promise<DomainAccount> {
    const entity = this.repository.create({
      userId: account.userId,
      accountNumber: account.accountNumber,
      balance: account.balance,
    });

    const saved = await this.repository.save(entity);
    return DomainAccount.fromPersistence(
      saved.id,
      saved.userId,
      saved.accountNumber,
      Number(saved.balance),
    );
  }

  async update(account: DomainAccount): Promise<DomainAccount> {
    if (!account.id) {
      throw new Error('Account ID is required for update');
    }

    await this.repository.update(account.id, {
      userId: account.userId,
      accountNumber: account.accountNumber,
      balance: account.balance,
    });

    const updated = await this.repository.findOne({ where: { id: account.id } });
    if (!updated) {
      throw new Error('Account not found after update');
    }

    return DomainAccount.fromPersistence(
      updated.id,
      updated.userId,
      updated.accountNumber,
      Number(updated.balance),
    );
  }

  async delete(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new Error('Account not found');
    }
  }
}
