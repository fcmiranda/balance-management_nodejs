import { Client } from '../../domain/entities/client';
import type { ClientRepository } from '../../domain/repositories/client-repository';

export class CreateClientUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(name: string, email: string): Promise<Client> {
    // Check if client with email already exists
    const existingClient = await this.clientRepository.findByEmail(email);
    if (existingClient) {
      throw new Error('Client with this email already exists');
    }

    const client = Client.create(name, email);
    return await this.clientRepository.save(client);
  }
}
