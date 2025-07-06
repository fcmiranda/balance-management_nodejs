import type {
  ClientResponse,
  IWithdrawUseCase,
  WithdrawRequest,
} from '@application/interfaces/client-use-cases';
import { NotFoundError } from '@domain/errors/domain-errors';
import type { ClientRepository } from '@domain/repositories/client-repository';

export class WithdrawUseCase implements IWithdrawUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(request: WithdrawRequest): Promise<ClientResponse> {
    const client = await this.clientRepository.findById(request.clientId);
    if (!client) {
      throw new NotFoundError('Client', request.clientId);
    }

    client.withdraw(request.amount);
    const updatedClient = await this.clientRepository.update(client);

    return {
      id: updatedClient.id || 0,
      name: updatedClient.name,
      email: updatedClient.email,
      balance: updatedClient.balance,
    };
  }
}
