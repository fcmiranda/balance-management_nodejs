import type { ClientRepository } from '../../domain/repositories/client-repository';
import type { DeleteClientRequest, IDeleteClientUseCase } from '../interfaces/client-use-cases';

export class DeleteClientUseCase implements IDeleteClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(request: DeleteClientRequest): Promise<void> {
    const client = await this.clientRepository.findById(request.id);
    if (!client) {
      throw new Error('Client not found');
    }

    await this.clientRepository.delete(request.id);
  }
}
