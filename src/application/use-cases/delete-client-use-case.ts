import type { ClientRepository } from '../../domain/repositories/client-repository';

export class DeleteClientUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(id: number): Promise<void> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new Error('Client not found');
    }

    await this.clientRepository.delete(id);
  }
}
