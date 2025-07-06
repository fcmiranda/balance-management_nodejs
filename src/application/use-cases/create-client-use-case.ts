import { Client } from '../../domain/entities/client';
import type { ClientRepository } from '../../domain/repositories/client-repository';
import type {
  ICreateClientUseCase,
  CreateClientRequest,
  ClientResponse,
} from '../interfaces/client-use-cases';

export class CreateClientUseCase implements ICreateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(request: CreateClientRequest): Promise<ClientResponse> {
    // Check if client with email already exists
    const existingClient = await this.clientRepository.findByEmail(request.email);
    if (existingClient) {
      throw new Error('Client with this email already exists');
    }

    const client = Client.create(request.name, request.email);
    const savedClient = await this.clientRepository.save(client);

    return {
      id: savedClient.id || 0,
      name: savedClient.name,
      email: savedClient.email,
      balance: savedClient.balance,
    };
  }
}
