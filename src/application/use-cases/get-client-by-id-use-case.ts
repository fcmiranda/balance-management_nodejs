import type { Client } from '../../domain/entities/client';
import type { ClientRepository } from '../../domain/repositories/client-repository';

export class GetClientByIdUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(id: number): Promise<Client | null> {
    return await this.clientRepository.findById(id);
  }
}
