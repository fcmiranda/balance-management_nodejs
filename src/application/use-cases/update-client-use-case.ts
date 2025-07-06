import type {
  ClientResponse,
  IUpdateClientUseCase,
  UpdateClientRequest,
} from '@application/interfaces/client-use-cases';
import type { ClientRepository } from '@domain/repositories/client-repository';

export class UpdateClientUseCase implements IUpdateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(request: UpdateClientRequest): Promise<ClientResponse> {
    const client = await this.clientRepository.findById(request.id);
    if (!client) {
      throw new Error('Client not found');
    }

    // Check if email is being changed and if it's already taken
    if (client.email !== request.email) {
      const existingClient = await this.clientRepository.findByEmail(request.email);
      if (existingClient && existingClient.id !== request.id) {
        throw new Error('Email is already taken by another client');
      }
    }

    client.updateInfo(request.name, request.email);
    const updatedClient = await this.clientRepository.update(client);

    return {
      id: updatedClient.id || 0,
      name: updatedClient.name,
      email: updatedClient.email,
      balance: updatedClient.balance,
    };
  }
}
