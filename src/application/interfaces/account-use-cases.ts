import type { AccountResponse } from '@domain/entities/account';
import type { CommandUseCase, CommandUseCaseVoid, QueryUseCase } from './use-case';

export interface CreateAccountRequest {
  userId: number;
  name: string;
}

export interface GetAccountByIdRequest {
  id: number;
}

export interface AccountDepositRequest {
  accountId: number;
  amount: number;
  userId: number; // For authorization
}

export interface AccountWithdrawRequest {
  accountId: number;
  amount: number;
  userId: number; // For authorization
}

export interface GetAccountsByUserIdRequest {
  userId: number;
}

export interface ICreateAccountUseCase
  extends CommandUseCase<CreateAccountRequest, AccountResponse> {}

export interface IGetAccountByIdUseCase
  extends CommandUseCase<GetAccountByIdRequest, AccountResponse | null> {}

export interface IGetAccountsByUserIdUseCase
  extends CommandUseCase<GetAccountsByUserIdRequest, AccountResponse[]> {}

export interface IAccountDepositUseCase
  extends CommandUseCase<AccountDepositRequest, AccountResponse> {}

export interface IAccountWithdrawUseCase
  extends CommandUseCase<AccountWithdrawRequest, AccountResponse> {}

// Re-export types for convenience
export type { AccountResponse };
