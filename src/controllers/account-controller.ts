import type {
  IAccountDepositUseCase,
  IAccountWithdrawUseCase,
  ICreateAccountUseCase,
  IGetAccountsByUserIdUseCase,
} from '@application/interfaces/account-use-cases';
import {
  handleAuthError,
  handleError,
  sendData,
} from '@infrastructure/middleware/standard-error-handler';
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
        handleAuthError('User not authenticated', req, res);
        return res;
      }

      const request = {
        userId: req.user.userId,
        name: req.body.name,
      };

      const useCase = this.createAccountUseCase;
      const account = await useCase.execute(request);
      sendData(account, res, 201);
      return res;
    } catch (error) {
      handleError(error, req, res);
      return res;
    }
  }

  async getUserAccounts(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        handleAuthError('User not authenticated', req, res);
        return res;
      }

      const useCase = this.getAccountsByUserIdUseCase;
      const accounts = await useCase.execute({ userId: req.user.userId });
      sendData(accounts, res);
      return res;
    } catch (error) {
      handleError(error, req, res);
      return res;
    }
  }

  async deposit(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        handleAuthError('User not authenticated', req, res);
        return res;
      }

      const request = {
        accountId: Number.parseInt(req.params.accountId),
        amount: req.body.amount,
        userId: req.user.userId,
      };

      const useCase = this.accountDepositUseCase;
      const account = await useCase.execute(request);
      sendData(account, res);
      return res;
    } catch (error) {
      handleError(error, req, res);
      return res;
    }
  }

  async withdraw(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        handleAuthError('User not authenticated', req, res);
        return res;
      }

      const request = {
        accountId: Number.parseInt(req.params.accountId),
        amount: req.body.amount,
        userId: req.user.userId,
      };

      const useCase = this.accountWithdrawUseCase;
      const account = await useCase.execute(request);
      sendData(account, res);
      return res;
    } catch (error) {
      handleError(error, req, res);
      return res;
    }
  }
}
