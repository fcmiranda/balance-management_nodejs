import type {
  IAccountDepositUseCase,
  IAccountWithdrawUseCase,
  ICreateAccountUseCase,
  IGetAccountsByUserIdUseCase,
} from '@application/interfaces/account-use-cases';
import { NotFoundError, UnauthorizedError } from '@domain/errors/domain-errors';
import type { Request, Response } from 'express';

export class AccountController {
  constructor(
    private readonly createAccountUseCase: ICreateAccountUseCase,
    private readonly getAccountsByUserIdUseCase: IGetAccountsByUserIdUseCase,
    private readonly accountDepositUseCase: IAccountDepositUseCase,
    private readonly accountWithdrawUseCase: IAccountWithdrawUseCase,
  ) {}

  async createAccount(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const request = {
        userId: req.user.userId,
        name: req.body.name,
      };

      const useCase = this.createAccountUseCase;
      const account = await useCase.execute(request);
      return res.status(201).json(account);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async getUserAccounts(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const useCase = this.getAccountsByUserIdUseCase;
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

      const useCase = this.accountDepositUseCase;
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

      const useCase = this.accountWithdrawUseCase;
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
