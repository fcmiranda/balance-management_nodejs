import { accountCreateDomainSchema, amountDomainSchema } from '@domain/validation/domain-schemas';
import { validateData } from '@infrastructure/validation/middleware';

export class Account {
  private constructor(
    private _id: number | null,
    private _userId: number,
    private _accountNumber: string,
    private _balance: number,
  ) {}

  static create(userId: number, accountNumber: string): Account {
    const validatedData = validateData(accountCreateDomainSchema, {
      userId,
      accountNumber,
    });
    return new Account(null, validatedData.userId, validatedData.accountNumber, 0);
  }

  static fromPersistence(
    id: number,
    userId: number,
    accountNumber: string,
    balance: number,
  ): Account {
    return new Account(id, userId, accountNumber, balance);
  }

  get id(): number | null {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get accountNumber(): string {
    return this._accountNumber;
  }

  get balance(): number {
    return this._balance;
  }

  deposit(amount: number): void {
    const validatedAmount = validateData(amountDomainSchema, amount);
    this._balance += validatedAmount;
  }

  withdraw(amount: number): void {
    const validatedAmount = validateData(amountDomainSchema, amount);
    if (validatedAmount > this._balance) {
      throw new Error('Insufficient balance');
    }
    this._balance -= validatedAmount;
  }

  canWithdraw(amount: number): boolean {
    try {
      const validatedAmount = validateData(amountDomainSchema, amount);
      return validatedAmount <= this._balance;
    } catch {
      return false;
    }
  }

  toJSON() {
    return {
      id: this._id,
      userId: this._userId,
      accountNumber: this._accountNumber,
      balance: this._balance,
    };
  }
}

export interface AccountResponse {
  id: number;
  userId: number;
  accountNumber: string;
  balance: number;
}
