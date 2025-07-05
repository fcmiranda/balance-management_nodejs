import path from 'node:path';
import sqlite3 from 'sqlite3';

export class Database {
  private static instance: Database;
  private db: sqlite3.Database;

  private constructor() {
    const dbPath = path.join(__dirname, '../../../database.sqlite');
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.initializeTables();
      }
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getConnection(): sqlite3.Database {
    return this.db;
  }

  private initializeTables(): void {
    const createClientTable = `
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        balance REAL NOT NULL DEFAULT 0
      )
    `;

    this.db.run(createClientTable, (err) => {
      if (err) {
        console.error('Error creating clients table:', err);
      } else {
        console.log('Clients table ready');
      }
    });
  }

  public close(): void {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}
