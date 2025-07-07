import {
  accountCreateDomainSchema,
  accountUpdateDomainSchema,
  amountDomainSchema,
} from '@domain/validation/domain-schemas';
import { validateData } from '@infrastructure/validation/middleware';

export class Account {
  private constructor(
    private _id: number | null,
    private _userId: number,
    private _accountNumber: string,
    private _balance: number,
    private _accountType: 'savings' | 'checking',
    private _status: 'active' | 'inactive' | 'frozen',
  ) {}

  static create(
    userId: number,
    accountNumber: string,
    accountType: 'savings' | 'checking' = 'savings',
  ): Account {
    const validatedData = validateData(accountCreateDomainSchema, {
      userId,
      accountNumber,
      accountType,
    });
    return new Account(
      null,
      validatedData.userId,
      validatedData.accountNumber,
      0,
      validatedData.accountType,
      'active',
    );
  }

  static fromPersistence(
    id: number,
    userId: number,
    accountNumber: string,
    balance: number,
    accountType: 'savings' | 'checking',
    status: 'active' | 'inactive' | 'frozen',
  ): Account {
    return new Account(id, userId, accountNumber, balance, accountType, status);
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

  get accountType(): 'savings' | 'checking' {
    return this._accountType;
  }

  get status(): 'active' | 'inactive' | 'frozen' {
    return this._status;
  }

  updateInfo(accountType: 'savings' | 'checking', status: 'active' | 'inactive' | 'frozen'): void {
    const validatedData = validateData(accountUpdateDomainSchema, { accountType, status });
    this._accountType = validatedData.accountType;
    this._status = validatedData.status;
  }

  deposit(amount: number): void {
    if (this._status !== 'active') {
      throw new Error('Cannot deposit to inactive or frozen account');
    }
    const validatedAmount = validateData(amountDomainSchema, amount);
    this._balance += validatedAmount;
  }

  withdraw(amount: number): void {
    if (this._status !== 'active') {
      throw new Error('Cannot withdraw from inactive or frozen account');
    }
    const validatedAmount = validateData(amountDomainSchema, amount);
    if (validatedAmount > this._balance) {
      throw new Error('Insufficient balance');
    }
    this._balance -= validatedAmount;
  }

  canWithdraw(amount: number): boolean {
    try {
      if (this._status !== 'active') {
        return false;
      }
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
      accountType: this._accountType,
      status: this._status,
    };
  }
}

export interface AccountResponse {
  id: number;
  userId: number;
  accountNumber: string;
  balance: number;
  accountType: 'savings' | 'checking';
  status: 'active' | 'inactive' | 'frozen';
}
