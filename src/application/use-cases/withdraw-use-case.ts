import type { Client } from '../../domain/entities/client';
import type { ClientRepository } from '../../domain/repositories/client-repository';

export class WithdrawUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(id: number, amount: number): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new Error('Client not found');
    }

    client.withdraw(amount);
    return await this.clientRepository.update(client);
  }
}
