import type { ClientRepository } from '../domain/repositories/client-repository';
import { SqliteClientRepository } from '../infrastructure/repositories/sqlite-client-repository';

import { CreateClientUseCase } from '../application/use-cases/create-client-use-case';
import { DeleteClientUseCase } from '../application/use-cases/delete-client-use-case';
import { DepositUseCase } from '../application/use-cases/deposit-use-case';
import { GetAllClientsUseCase } from '../application/use-cases/get-all-clients-use-case';
import { GetClientByIdUseCase } from '../application/use-cases/get-client-by-id-use-case';
import { UpdateClientUseCase } from '../application/use-cases/update-client-use-case';
import { WithdrawUseCase } from '../application/use-cases/withdraw-use-case';

export class Container {
  private static instance: Container;
  private clientRepository: ClientRepository;

  private createClientUseCase: CreateClientUseCase;
  private getAllClientsUseCase: GetAllClientsUseCase;
  private getClientByIdUseCase: GetClientByIdUseCase;
  private updateClientUseCase: UpdateClientUseCase;
  private deleteClientUseCase: DeleteClientUseCase;
  private depositUseCase: DepositUseCase;
  private withdrawUseCase: WithdrawUseCase;

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

  public getCreateClientUseCase(): CreateClientUseCase {
    return this.createClientUseCase;
  }

  public getGetAllClientsUseCase(): GetAllClientsUseCase {
    return this.getAllClientsUseCase;
  }

  public getGetClientByIdUseCase(): GetClientByIdUseCase {
    return this.getClientByIdUseCase;
  }

  public getUpdateClientUseCase(): UpdateClientUseCase {
    return this.updateClientUseCase;
  }

  public getDeleteClientUseCase(): DeleteClientUseCase {
    return this.deleteClientUseCase;
  }

  public getDepositUseCase(): DepositUseCase {
    return this.depositUseCase;
  }

  public getWithdrawUseCase(): WithdrawUseCase {
    return this.withdrawUseCase;
  }
}
