import db from '../database';
import { CreateClientRequest, UpdateClientRequest, DepositRequest, WithdrawalRequest } from '../types';

export class ClientController {
    
    static async getAllClients(req: any, res: any): Promise<any> {
        const query = 'SELECT * FROM clients';
        db.all(query, [], (err: any, rows: any) => {
            if (err) 
                return res.status(400).json({error: err.message});
            return res.json(rows);
        });
    }

    static async getClientById(req: any, res: any): Promise<any> {
        const {id} = req.params;
        const query = 'SELECT * FROM clients WHERE id = ?';
        db.all(query, [id], (err: any, rows: any) => {
            if (err) 
                return res.status(400).json({error: err.message});
            return res.json(rows);
        });
    }

    static async createClient(req: any, res: any): Promise<any> {
        const {name, email}: CreateClientRequest = req.body;
        try {
            db.run(`INSERT INTO clients(name, email) VALUES(?, ?)`, [name, email]);
            return res.status(200).json();
        } catch(err) {
            console.log(err);
            return res.status(400).json(err);
        }
    }

    static async updateClient(req: any, res: any): Promise<any> {
        const { id } = req.params;
        const {name, email}: UpdateClientRequest = req.body;
        try {
            db.run(`UPDATE clients SET name = ?, email = ? WHERE id = ?`, [name, email, id]);
            return res.status(200).json();
        } catch(err) {
            console.log(err);
            return res.status(400).json(err);
        }
    }

    static async deleteClient(req: any, res: any): Promise<any> {
        const { id } = req.params;
        try {
            db.run(`DELETE FROM clients WHERE id = ?`, [id]);
            return res.status(200).json();
        } catch(err) {
            console.log(err);
            return res.status(400).json(err);
        }
    }

    static async deposit(req: any, res: any): Promise<any> {
        const { id } = req.params;
        const { amount }: DepositRequest = req.body;
        console.log({id, amount});
        try {
            db.run(`UPDATE clients SET balance = balance + ? WHERE id = ?`, [amount, id]);
            return res.status(200).json();
        } catch(err) {
            console.log(err);
            return res.status(400).json(err);
        }
    }

    static async withdraw(req: any, res: any): Promise<any> {
        const { id } = req.params;
        const { amount }: WithdrawalRequest = req.body;
        console.log({id, amount});
        try {
            db.run(`UPDATE clients SET balance = balance - ? WHERE id = ?`, [amount, id]);
            return res.status(200).json();
        } catch(err) {
            console.log(err);
            return res.status(400).json(err);
        }
    }
}
