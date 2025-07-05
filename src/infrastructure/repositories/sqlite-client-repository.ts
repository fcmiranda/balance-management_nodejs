import { Client } from '../../domain/entities/client';
import type { ClientRepository } from '../../domain/repositories/client-repository';
import { Database } from '../database/database';

interface ClientRow {
  id: number;
  name: string;
  email: string;
  balance: number;
}

export class SqliteClientRepository implements ClientRepository {
  private db = Database.getInstance().getConnection();

  async findAll(): Promise<Client[]> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM clients';
      this.db.all(query, [], (err, rows: ClientRow[]) => {
        if (err) {
          reject(err);
        } else {
          const clients = rows.map((row) =>
            Client.fromPersistence(row.id, row.name, row.email, row.balance),
          );
          resolve(clients);
        }
      });
    });
  }

  async findById(id: number): Promise<Client | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM clients WHERE id = ?';
      this.db.get(query, [id], (err, row: ClientRow | undefined) => {
        if (err) {
          reject(err);
        } else if (row) {
          const client = Client.fromPersistence(row.id, row.name, row.email, row.balance);
          resolve(client);
        } else {
          resolve(null);
        }
      });
    });
  }

  async findByEmail(email: string): Promise<Client | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM clients WHERE email = ?';
      this.db.get(query, [email], (err, row: ClientRow) => {
        if (err) {
          reject(err);
        } else if (row) {
          const client = Client.fromPersistence(row.id, row.name, row.email, row.balance);
          resolve(client);
        } else {
          resolve(null);
        }
      });
    });
  }

  async save(client: Client): Promise<Client> {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO clients (name, email, balance) VALUES (?, ?, ?)';
      this.db.run(query, [client.name, client.email, client.balance], function (err) {
        if (err) {
          reject(err);
        } else {
          const savedClient = Client.fromPersistence(
            this.lastID,
            client.name,
            client.email,
            client.balance,
          );
          resolve(savedClient);
        }
      });
    });
  }

  async update(client: Client): Promise<Client> {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE clients SET name = ?, email = ?, balance = ? WHERE id = ?';
      this.db.run(query, [client.name, client.email, client.balance, client.id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(client);
        }
      });
    });
  }

  async delete(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM clients WHERE id = ?';
      this.db.run(query, [id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
