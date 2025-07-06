import type { Request, Response } from 'express';
import type { IContainer } from '../application/interfaces/use-case-factory';
import { DuplicateError, NotFoundError } from '../domain/errors/domain-errors';
import { Container } from '../infrastructure/container';

export class ClientController {
  private readonly container: IContainer = Container.getInstance();

  async getAllClients(_req: Request, res: Response): Promise<Response> {
    try {
      const useCase = this.container.getGetAllClientsUseCase();
      const clients = await useCase.execute();
      return res.json(clients);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async getClientById(req: Request, res: Response): Promise<Response> {
    try {
      // Params are already validated by middleware
      const request = { id: Number.parseInt(req.params.id) };
      const useCase = this.container.getGetClientByIdUseCase();
      const client = await useCase.execute(request);

      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      return res.json(client);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async createClient(req: Request, res: Response): Promise<Response> {
    try {
      // Body is already validated by middleware
      const request = req.body;
      const useCase = this.container.getCreateClientUseCase();
      const client = await useCase.execute(request);
      return res.status(201).json(client);
    } catch (error) {
      if (error instanceof DuplicateError) {
        return res.status(409).json({ error: error.message });
      }
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async updateClient(req: Request, res: Response): Promise<Response> {
    try {
      // Both body and params are already validated by middleware
      const request = {
        id: Number.parseInt(req.params.id),
        name: req.body.name,
        email: req.body.email,
      };
      const useCase = this.container.getUpdateClientUseCase();
      const client = await useCase.execute(request);
      return res.json(client);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async deleteClient(req: Request, res: Response): Promise<Response> {
    try {
      // Params are already validated by middleware
      const request = { id: Number.parseInt(req.params.id) };
      const useCase = this.container.getDeleteClientUseCase();
      await useCase.execute(request);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async deposit(req: Request, res: Response): Promise<Response> {
    try {
      // Both body and params are already validated by middleware
      const request = {
        clientId: Number.parseInt(req.params.id),
        amount: req.body.amount,
      };
      const useCase = this.container.getDepositUseCase();
      const client = await useCase.execute(request);
      return res.json(client);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async withdraw(req: Request, res: Response): Promise<Response> {
    try {
      // Both body and params are already validated by middleware
      const request = {
        clientId: Number.parseInt(req.params.id),
        amount: req.body.amount,
      };
      const useCase = this.container.getWithdrawUseCase();
      const client = await useCase.execute(request);
      return res.json(client);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(400).json({ error: (error as Error).message });
    }
  }
}
