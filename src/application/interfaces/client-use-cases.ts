import type { Client } from '../../domain/entities/client';
import type { UseCase, QueryUseCase, CommandUseCase, CommandUseCaseVoid } from './use-case';

// Request/Response DTOs
export interface CreateClientRequest {
  name: string;
  email: string;
}

export interface UpdateClientRequest {
  id: number;
  name: string;
  email: string;
}

export interface GetClientByIdRequest {
  id: number;
}

export interface DeleteClientRequest {
  id: number;
}

export interface DepositRequest {
  clientId: number;
  amount: number;
}

export interface WithdrawRequest {
  clientId: number;
  amount: number;
}

export interface ClientResponse {
  id: number;
  name: string;
  email: string;
  balance: number;
}

export interface ICreateClientUseCase extends CommandUseCase<CreateClientRequest, ClientResponse> {}

export interface IGetAllClientsUseCase extends QueryUseCase<ClientResponse[]> {}

export interface IGetClientByIdUseCase
  extends CommandUseCase<GetClientByIdRequest, ClientResponse | null> {}

export interface IUpdateClientUseCase extends CommandUseCase<UpdateClientRequest, ClientResponse> {}

export interface IDeleteClientUseCase extends CommandUseCaseVoid<DeleteClientRequest> {}

export interface IDepositUseCase extends CommandUseCase<DepositRequest, ClientResponse> {}

export interface IWithdrawUseCase extends CommandUseCase<WithdrawRequest, ClientResponse> {}
