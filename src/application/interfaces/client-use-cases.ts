import type { Client } from '../../domain/entities/client';
import type {
  ClientResponse,
  CreateClientRequest,
  DeleteClientRequest,
  DepositRequest,
  GetClientByIdRequest,
  UpdateClientRequest,
  WithdrawRequest,
} from '../../infrastructure/validation/schemas';
import type { CommandUseCase, CommandUseCaseVoid, QueryUseCase, UseCase } from './use-case';

export interface ICreateClientUseCase extends CommandUseCase<CreateClientRequest, ClientResponse> {}

export interface IGetAllClientsUseCase extends QueryUseCase<ClientResponse[]> {}

export interface IGetClientByIdUseCase
  extends CommandUseCase<GetClientByIdRequest, ClientResponse | null> {}

export interface IUpdateClientUseCase extends CommandUseCase<UpdateClientRequest, ClientResponse> {}

export interface IDeleteClientUseCase extends CommandUseCaseVoid<DeleteClientRequest> {}

export interface IDepositUseCase extends CommandUseCase<DepositRequest, ClientResponse> {}

export interface IWithdrawUseCase extends CommandUseCase<WithdrawRequest, ClientResponse> {}

// Re-export types for convenience
export type {
  CreateClientRequest,
  UpdateClientRequest,
  GetClientByIdRequest,
  DeleteClientRequest,
  DepositRequest,
  WithdrawRequest,
  ClientResponse,
} from '../../infrastructure/validation/schemas';
