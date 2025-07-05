import sqlite3 from 'sqlite3';

const database = new sqlite3.Database(':memory:');

database.serialize(() => {
    database.run(`CREATE TABLE clients(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        balance DECIMAL(15,2) DEFAULT 0.00
    )`);

    database.run(`INSERT INTO clients(name, email, balance) VALUES(?, ?, 0)`, ['TEST', 'TEST@TEST.com']);
});

export default database;
