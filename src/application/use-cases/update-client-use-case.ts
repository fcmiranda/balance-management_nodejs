import type { Client } from '../../domain/entities/client';
import type { ClientRepository } from '../../domain/repositories/client-repository';

export class UpdateClientUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(id: number, name: string, email: string): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new Error('Client not found');
    }

    // Check if email is being changed and if it's already taken
    if (client.email !== email) {
      const existingClient = await this.clientRepository.findByEmail(email);
      if (existingClient && existingClient.id !== id) {
        throw new Error('Email is already taken by another client');
      }
    }

    client.updateInfo(name, email);
    return await this.clientRepository.update(client);
  }
}
