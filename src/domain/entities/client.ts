export class Client {
  private constructor(
    private _id: number | null,
    private _name: string,
    private _email: string,
    private _balance: number,
  ) {}

  static create(name: string, email: string): Client {
    Client.validateName(name);
    Client.validateEmail(email);
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
    Client.validateName(name);
    Client.validateEmail(email);
    this._name = name.trim();
    this._email = email.trim();
  }

  deposit(amount: number): void {
    Client.validateAmount(amount);
    this._balance += amount;
  }

  withdraw(amount: number): void {
    Client.validateAmount(amount);
    if (amount > this._balance) {
      throw new Error('Insufficient balance');
    }
    this._balance -= amount;
  }

  canWithdraw(amount: number): boolean {
    return amount > 0 && amount <= this._balance;
  }

  private static validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    if (name.trim().length > 100) {
      throw new Error('Name cannot exceed 100 characters');
    }
  }

  private static validateEmail(email: string): void {
    if (!email || !Client.isValidEmail(email)) {
      throw new Error('Valid email is required');
    }
  }

  private static validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    if (!Number.isFinite(amount)) {
      throw new Error('Amount must be a valid number');
    }
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
