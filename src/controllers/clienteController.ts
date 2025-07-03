import db from '../database';
import { CreateClienteRequest, UpdateClienteRequest, DepositRequest, WithdrawalRequest } from '../types';

export class ClienteController {
    
    static async getAllClientes(req: any, res: any): Promise<any> {
        const query = 'SELECT * FROM clientes';
        db.all(query, [], (err: any, rows: any) => {
            if (err) 
                return res.status(400).json({error: err.message});
            return res.json(rows);
        });
    }

    static async getClienteById(req: any, res: any): Promise<any> {
        const {id} = req.params;
        const query = 'SELECT * FROM clientes WHERE id = ?';
        db.all(query, [id], (err: any, rows: any) => {
            if (err) 
                return res.status(400).json({error: err.message});
            return res.json(rows);
        });
    }

    static async createCliente(req: any, res: any): Promise<any> {
        const {nome, email}: CreateClienteRequest = req.body;
        try {
            db.run(`INSERT INTO clientes(nome, email) VALUES(?, ?)`, [nome, email]);
            return res.status(200).json();
        } catch(err) {
            console.log(err);
            return res.status(400).json(err);
        }
    }

    static async updateCliente(req: any, res: any): Promise<any> {
        const { id } = req.params;
        const {nome, email}: UpdateClienteRequest = req.body;
        try {
            db.run(`UPDATE clientes SET nome = ?, email = ? WHERE id = ?`, [nome, email, id]);
            return res.status(200).json();
        } catch(err) {
            console.log(err);
            return res.status(400).json(err);
        }
    }

    static async deleteCliente(req: any, res: any): Promise<any> {
        const { id } = req.params;
        try {
            db.run(`DELETE FROM clientes WHERE id = ?`, [id]);
            return res.status(200).json();
        } catch(err) {
            console.log(err);
            return res.status(400).json(err);
        }
    }

    static async deposit(req: any, res: any): Promise<any> {
        const { id } = req.params;
        const { valor }: DepositRequest = req.body;
        console.log({id, valor});
        try {
            db.run(`UPDATE clientes SET saldo = saldo + ? WHERE id = ?`, [valor, id]);
            return res.status(200).json();
        } catch(err) {
            console.log(err);
            return res.status(400).json(err);
        }
    }

    static async withdraw(req: any, res: any): Promise<any> {
        const { id } = req.params;
        const { valor }: WithdrawalRequest = req.body;
        console.log({id, valor});
        try {
            db.run(`UPDATE clientes SET saldo = saldo - ? WHERE id = ?`, [valor, id]);
            return res.status(200).json();
        } catch(err) {
            console.log(err);
            return res.status(400).json(err);
        }
    }
}
