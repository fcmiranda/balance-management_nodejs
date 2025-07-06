import { Client } from '../../../src/domain/entities/client';

describe('Client Entity', () => {
  describe('create', () => {
    it('should create a new client with valid data', () => {
      const client = Client.create('John Doe', 'john@example.com');
      
      expect(client.name).toBe('John Doe');
      expect(client.email).toBe('john@example.com');
      expect(client.balance).toBe(0);
      expect(client.id).toBeNull();
    });

    it('should throw error for invalid name', () => {
      expect(() => {
        Client.create('', 'john@example.com');
      }).toThrow();
    });

    it('should throw error for invalid email', () => {
      expect(() => {
        Client.create('John Doe', 'invalid-email');
      }).toThrow();
    });
  });

  describe('fromPersistence', () => {
    it('should create client from persistence data', () => {
      const client = Client.fromPersistence(1, 'John Doe', 'john@example.com', 1000);
      
      expect(client.id).toBe(1);
      expect(client.name).toBe('John Doe');
      expect(client.email).toBe('john@example.com');
      expect(client.balance).toBe(1000);
    });
  });

  describe('updateInfo', () => {
    it('should update client info with valid data', () => {
      const client = Client.fromPersistence(1, 'John Doe', 'john@example.com', 1000);
      
      client.updateInfo('Jane Doe', 'jane@example.com');
      
      expect(client.name).toBe('Jane Doe');
      expect(client.email).toBe('jane@example.com');
    });

    it('should throw error for invalid update data', () => {
      const client = Client.fromPersistence(1, 'John Doe', 'john@example.com', 1000);
      
      expect(() => {
        client.updateInfo('', 'invalid-email');
      }).toThrow();
    });
  });

  describe('deposit', () => {
    it('should increase balance with valid amount', () => {
      const client = Client.fromPersistence(1, 'John Doe', 'john@example.com', 1000);
      
      client.deposit(500);
      
      expect(client.balance).toBe(1500);
    });

    it('should throw error for invalid deposit amount', () => {
      const client = Client.fromPersistence(1, 'John Doe', 'john@example.com', 1000);
      
      expect(() => {
        client.deposit(-100);
      }).toThrow();
    });

    it('should throw error for zero deposit', () => {
      const client = Client.fromPersistence(1, 'John Doe', 'john@example.com', 1000);
      
      expect(() => {
        client.deposit(0);
      }).toThrow();
    });
  });

  describe('withdraw', () => {
    it('should decrease balance with valid amount', () => {
      const client = Client.fromPersistence(1, 'John Doe', 'john@example.com', 1000);
      
      client.withdraw(300);
      
      expect(client.balance).toBe(700);
    });

    it('should throw error for insufficient balance', () => {
      const client = Client.fromPersistence(1, 'John Doe', 'john@example.com', 1000);
      
      expect(() => {
        client.withdraw(1500);
      }).toThrow('Insufficient balance');
    });

    it('should throw error for invalid withdrawal amount', () => {
      const client = Client.fromPersistence(1, 'John Doe', 'john@example.com', 1000);
      
      expect(() => {
        client.withdraw(-100);
      }).toThrow();
    });
  });

  describe('canWithdraw', () => {
    it('should return true for valid withdrawal amount', () => {
      const client = Client.fromPersistence(1, 'John Doe', 'john@example.com', 1000);
      
      expect(client.canWithdraw(500)).toBe(true);
      expect(client.canWithdraw(1000)).toBe(true);
    });

    it('should return false for insufficient balance', () => {
      const client = Client.fromPersistence(1, 'John Doe', 'john@example.com', 1000);
      
      expect(client.canWithdraw(1500)).toBe(false);
    });

    it('should return false for invalid amount', () => {
      const client = Client.fromPersistence(1, 'John Doe', 'john@example.com', 1000);
      
      expect(client.canWithdraw(-100)).toBe(false);
      expect(client.canWithdraw(0)).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return client data as JSON', () => {
      const client = Client.fromPersistence(1, 'John Doe', 'john@example.com', 1000);
      
      const json = client.toJSON();
      
      expect(json).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        balance: 1000,
      });
    });
  });
});
