import type {
  ClientResponse,
  DepositRequest,
  IDepositUseCase,
} from '@application/interfaces/client-use-cases';
import { NotFoundError } from '@domain/errors/domain-errors';
import type { ClientRepository } from '@domain/repositories/client-repository';

export class DepositUseCase implements IDepositUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(request: DepositRequest): Promise<ClientResponse> {
    const client = await this.clientRepository.findById(request.clientId);
    if (!client) {
      throw new NotFoundError('Client', request.clientId);
    }

    client.deposit(request.amount);
    const updatedClient = await this.clientRepository.update(client);

    return {
      id: updatedClient.id || 0,
      name: updatedClient.name,
      email: updatedClient.email,
      balance: updatedClient.balance,
    };
  }
}
