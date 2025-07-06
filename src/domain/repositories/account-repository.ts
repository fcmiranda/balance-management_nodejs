import type { Account } from '../entities/account';

export interface AccountRepository {
  findAll(): Promise<Account[]>;
  findById(id: number): Promise<Account | null>;
  findByUserId(userId: number): Promise<Account[]>;
  findByAccountNumber(accountNumber: string): Promise<Account | null>;
  save(account: Account): Promise<Account>;
  update(account: Account): Promise<Account>;
  delete(id: number): Promise<void>;
}
