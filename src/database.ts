import sqlite3 from 'sqlite3';

const database = new sqlite3.Database(':memory:');

database.serialize(() => {
    database.run(`CREATE TABLE clients(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
    )`);

    database.run(`CREATE TABLE accounts(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        balance DECIMAL(15,2) DEFAULT 0.00,
        client_id INTEGER,
        FOREIGN KEY(client_id) REFERENCES clients(id)
    )`);

    database.run(`INSERT INTO clients(name, email) VALUES(?, ?)`, ['TEST', 'TEST@TEST.com'], function (err) {
        if (err) {
            return console.error(err.message);
        }
        database.run(`INSERT INTO accounts(client_id, balance) VALUES(?, ?)`, [this.lastID, 0]);
    });
});

export default database;
