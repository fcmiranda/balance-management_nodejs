import type { ClientRepository } from '../../domain/repositories/client-repository';
import { validateData } from '../../infrastructure/validation/middleware';
import { deleteClientRequestSchema } from '../../infrastructure/validation/schemas';
import type { DeleteClientRequest, IDeleteClientUseCase } from '../interfaces/client-use-cases';

export class DeleteClientUseCase implements IDeleteClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(request: DeleteClientRequest): Promise<void> {
    // Validate input data
    const validatedRequest = validateData(deleteClientRequestSchema, request);

    const client = await this.clientRepository.findById(validatedRequest.id);
    if (!client) {
      throw new Error('Client not found');
    }

    await this.clientRepository.delete(validatedRequest.id);
  }
}
