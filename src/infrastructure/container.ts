import type {
  ICreateClientUseCase,
  IDeleteClientUseCase,
  IDepositUseCase,
  IGetAllClientsUseCase,
  IGetClientByIdUseCase,
  IUpdateClientUseCase,
  IWithdrawUseCase,
} from '../application/interfaces/client-use-cases';
import type { IContainer } from '../application/interfaces/use-case-factory';
import type { ClientRepository } from '../domain/repositories/client-repository';
import { SqliteClientRepository } from '../infrastructure/repositories/sqlite-client-repository';

import { CreateClientUseCase } from '../application/use-cases/create-client-use-case';
import { DeleteClientUseCase } from '../application/use-cases/delete-client-use-case';
import { DepositUseCase } from '../application/use-cases/deposit-use-case';
import { GetAllClientsUseCase } from '../application/use-cases/get-all-clients-use-case';
import { GetClientByIdUseCase } from '../application/use-cases/get-client-by-id-use-case';
import { UpdateClientUseCase } from '../application/use-cases/update-client-use-case';
import { WithdrawUseCase } from '../application/use-cases/withdraw-use-case';

export class Container implements IContainer {
  private static instance: Container;
  private readonly clientRepository: ClientRepository;

  private readonly createClientUseCase: ICreateClientUseCase;
  private readonly getAllClientsUseCase: IGetAllClientsUseCase;
  private readonly getClientByIdUseCase: IGetClientByIdUseCase;
  private readonly updateClientUseCase: IUpdateClientUseCase;
  private readonly deleteClientUseCase: IDeleteClientUseCase;
  private readonly depositUseCase: IDepositUseCase;
  private readonly withdrawUseCase: IWithdrawUseCase;

  private constructor() {
    this.clientRepository = new SqliteClientRepository();

    this.createClientUseCase = new CreateClientUseCase(this.clientRepository);
    this.getAllClientsUseCase = new GetAllClientsUseCase(this.clientRepository);
    this.getClientByIdUseCase = new GetClientByIdUseCase(this.clientRepository);
    this.updateClientUseCase = new UpdateClientUseCase(this.clientRepository);
    this.deleteClientUseCase = new DeleteClientUseCase(this.clientRepository);
    this.depositUseCase = new DepositUseCase(this.clientRepository);
    this.withdrawUseCase = new WithdrawUseCase(this.clientRepository);
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  public getClientRepository(): ClientRepository {
    return this.clientRepository;
  }

  public getCreateClientUseCase(): ICreateClientUseCase {
    return this.createClientUseCase;
  }

  public getGetAllClientsUseCase(): IGetAllClientsUseCase {
    return this.getAllClientsUseCase;
  }

  public getGetClientByIdUseCase(): IGetClientByIdUseCase {
    return this.getClientByIdUseCase;
  }

  public getUpdateClientUseCase(): IUpdateClientUseCase {
    return this.updateClientUseCase;
  }

  public getDeleteClientUseCase(): IDeleteClientUseCase {
    return this.deleteClientUseCase;
  }

  public getDepositUseCase(): IDepositUseCase {
    return this.depositUseCase;
  }

  public getWithdrawUseCase(): IWithdrawUseCase {
    return this.withdrawUseCase;
  }
}
