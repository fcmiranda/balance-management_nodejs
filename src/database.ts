import sqlite3 from 'sqlite3';

const database = new sqlite3.Database(':memory:');

database.serialize(() => {
    database.run(`CREATE TABLE clientes(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        saldo FLOAT
    )`);

    database.run(`INSERT INTO clientes(nome, email, saldo) VALUES(?, ?, 0)`, ['TESTE', 'TESTE@TESTE.com.br']);
});

export default database;
