import type { IContainer } from '@application/interfaces/use-case-factory';
import { NotFoundError, UnauthorizedError } from '@domain/errors/domain-errors';
import { Container } from '@infrastructure/container';
import type { Request, Response } from 'express';

export class AccountController {
  private readonly container: IContainer = Container.getInstance();

  async getUserAccounts(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const useCase = this.container.getGetAccountsByUserIdUseCase();
      const accounts = await useCase.execute({ userId: req.user.userId });
      return res.json(accounts);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async deposit(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const request = {
        accountId: Number.parseInt(req.params.accountId),
        amount: req.body.amount,
        userId: req.user.userId,
      };

      const useCase = this.container.getAccountDepositUseCase();
      const account = await useCase.execute(request);
      return res.json(account);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof UnauthorizedError) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async withdraw(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const request = {
        accountId: Number.parseInt(req.params.accountId),
        amount: req.body.amount,
        userId: req.user.userId,
      };

      const useCase = this.container.getAccountWithdrawUseCase();
      const account = await useCase.execute(request);
      return res.json(account);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof UnauthorizedError) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(400).json({ error: (error as Error).message });
    }
  }
}
