import type { ClientRepository } from '../../domain/repositories/client-repository';
import type { ClientResponse, IGetAllClientsUseCase } from '../interfaces/client-use-cases';

export class GetAllClientsUseCase implements IGetAllClientsUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(): Promise<ClientResponse[]> {
    const clients = await this.clientRepository.findAll();

    return clients.map((client) => ({
      id: client.id || 0,
      name: client.name,
      email: client.email,
      balance: client.balance,
    }));
  }
}
