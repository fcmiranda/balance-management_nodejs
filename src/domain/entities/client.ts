import {
  amountDomainSchema,
  clientCreateDomainSchema,
  clientUpdateDomainSchema,
} from '@domain/validation/domain-schemas';
import { validateData } from '@infrastructure/validation/middleware';

export class Client {
  private constructor(
    private _id: number | null,
    private _name: string,
    private _email: string,
    private _balance: number,
  ) {}

  static create(name: string, email: string): Client {
    const validatedData = validateData(clientCreateDomainSchema, { name, email });
    return new Client(null, validatedData.name, validatedData.email, 0);
  }

  static fromPersistence(id: number, name: string, email: string, balance: number): Client {
    return new Client(id, name, email, balance);
  }

  get id(): number | null {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get balance(): number {
    return this._balance;
  }

  updateInfo(name: string, email: string): void {
    const validatedData = validateData(clientUpdateDomainSchema, { name, email });
    this._name = validatedData.name;
    this._email = validatedData.email;
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

  // ...existing code...

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      balance: this._balance,
    };
  }
}

export interface ClientResponse {
  id: number;
  name: string;
  email: string;
  balance: number;
}
