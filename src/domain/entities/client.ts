export class Client {
  private constructor(
    private _id: number | null,
    private _name: string,
    private _email: string,
    private _balance: number,
  ) {}

  static create(name: string, email: string): Client {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (!email || !Client.isValidEmail(email)) {
      throw new Error('Valid email is required');
    }
    return new Client(null, name.trim(), email.trim(), 0);
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
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (!email || !Client.isValidEmail(email)) {
      throw new Error('Valid email is required');
    }
    this._name = name.trim();
    this._email = email.trim();
  }

  deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }
    this._balance += amount;
  }

  withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    if (amount > this._balance) {
      throw new Error('Insufficient balance');
    }
    this._balance -= amount;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      balance: this._balance,
    };
  }
}
