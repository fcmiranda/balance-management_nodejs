import type { User } from '../../domain/entities/auth';
import type { AuthRepository } from '../../domain/repositories/auth-repository';
import { Database } from '../database/database';

interface UserRow {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'client';
  created_at: string;
  updated_at: string;
}

export class SQLiteAuthRepository implements AuthRepository {
  private db = Database.getInstance().getConnection();

  constructor() {
    this.initializeTable();
  }

  private initializeTable(): void {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'client',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.exec(createTableQuery);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';

      this.db.get(query, [email], (err, row: UserRow) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        const user: User = {
          id: row.id,
          email: row.email,
          password: row.password,
          role: row.role,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        };

        resolve(user);
      });
    });
  }

  async createUser(email: string, hashedPassword: string, role: string): Promise<User> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users (email, password, role) 
        VALUES (?, ?, ?)
      `;

      const db = this.db;

      db.run(query, [email, hashedPassword, role], function (err) {
        if (err) {
          reject(err);
          return;
        }

        const insertId = this.lastID;
        const selectQuery = 'SELECT * FROM users WHERE id = ?';

        db.get(selectQuery, [insertId], (err, row: UserRow) => {
          if (err) {
            reject(err);
            return;
          }

          const user: User = {
            id: row.id,
            email: row.email,
            password: row.password,
            role: row.role,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
          };

          resolve(user);
        });
      });
    });
  }

  async findUserById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE id = ?';

      this.db.get(query, [id], (err, row: UserRow) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        const user: User = {
          id: row.id,
          email: row.email,
          password: row.password,
          role: row.role,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        };

        resolve(user);
      });
    });
  }
}
