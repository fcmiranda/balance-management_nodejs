import { accountCreateDomainSchema, amountDomainSchema } from '@domain/validation/domain-schemas';
import { validateData } from '@infrastructure/validation/middleware';

export class Account {
  private constructor(
    private _id: number | null,
    private _userId: number,
    private _accountNumber: string,
    private _balance: number,
    private _createdAt?: Date,
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
    createdAt?: Date,
  ): Account {
    return new Account(id, userId, accountNumber, balance, createdAt);
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

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  private roundToTwoDecimals(value: number): number {
    return Number((Math.round(value * 100) / 100).toFixed(2));
  }

  deposit(amount: number): void {
    const validatedAmount = validateData(amountDomainSchema, amount);
    this._balance = this.roundToTwoDecimals(this._balance + validatedAmount);
  }

  withdraw(amount: number): void {
    const validatedAmount = validateData(amountDomainSchema, amount);
    const newBalance = this.roundToTwoDecimals(this._balance - validatedAmount);
    if (newBalance < 0) {
      throw new Error('Insufficient balance');
    }
    this._balance = newBalance;
  }

  canWithdraw(amount: number): boolean {
    try {
      const validatedAmount = validateData(amountDomainSchema, amount);
      const newBalance = this.roundToTwoDecimals(this._balance - validatedAmount);
      return newBalance >= 0;
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
      createdAt: this._createdAt,
    };
  }
}

export interface AccountResponse {
  id: number;
  userId: number;
  accountNumber: string;
  balance: number;
  createdAt?: Date;
}
