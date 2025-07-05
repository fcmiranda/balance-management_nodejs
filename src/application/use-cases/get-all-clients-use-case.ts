import type { Client } from '../../domain/entities/client';
import type { ClientRepository } from '../../domain/repositories/client-repository';

export class GetAllClientsUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(): Promise<Client[]> {
    return await this.clientRepository.findAll();
  }
}
