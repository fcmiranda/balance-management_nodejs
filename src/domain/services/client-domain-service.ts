import type { ClientRepository } from '../repositories/client-repository';
import { DuplicateError } from '../errors/domain-errors';

export class ClientDomainService {
  constructor(private readonly clientRepository: ClientRepository) {}

  async validateUniqueEmail(email: string, excludeId?: number): Promise<void> {
    const existingClient = await this.clientRepository.findByEmail(email);

    if (existingClient && existingClient.id !== excludeId) {
      throw new DuplicateError('Client', 'email', email);
    }
  }
}
