import type { Request, Response } from 'express';
import { Container } from '../infrastructure/container';
import type {
  CreateClientRequest,
  DepositRequest,
  UpdateClientRequest,
  WithdrawalRequest,
} from '../types';

export class ClientController {
  private container = Container.getInstance();

  async getAllClients(_req: Request, res: Response): Promise<Response> {
    try {
      const useCase = this.container.getGetAllClientsUseCase();
      const clients = await useCase.execute();
      return res.json(clients.map((client) => client.toJSON()));
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async getClientById(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number.parseInt(req.params.id);
      const useCase = this.container.getGetClientByIdUseCase();
      const client = await useCase.execute(id);

      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      return res.json(client.toJSON());
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async createClient(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email }: CreateClientRequest = req.body;
      const useCase = this.container.getCreateClientUseCase();
      const client = await useCase.execute(name, email);
      return res.status(201).json(client.toJSON());
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async updateClient(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number.parseInt(req.params.id);
      const { name, email }: UpdateClientRequest = req.body;
      const useCase = this.container.getUpdateClientUseCase();
      const client = await useCase.execute(id, name, email);
      return res.json(client.toJSON());
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async deleteClient(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number.parseInt(req.params.id);
      const useCase = this.container.getDeleteClientUseCase();
      await useCase.execute(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async deposit(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number.parseInt(req.params.id);
      const { amount }: DepositRequest = req.body;
      const useCase = this.container.getDepositUseCase();
      const client = await useCase.execute(id, amount);
      return res.json(client.toJSON());
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async withdraw(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number.parseInt(req.params.id);
      const { amount }: WithdrawalRequest = req.body;
      const useCase = this.container.getWithdrawUseCase();
      const client = await useCase.execute(id, amount);
      return res.json(client.toJSON());
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }
}
