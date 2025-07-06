import { z } from 'zod';
import type { ClientRepository } from '../../domain/repositories/client-repository';
import { validateData } from '../../infrastructure/validation/middleware';
import { clientResponseSchema } from '../../infrastructure/validation/schemas';
import type { ClientResponse, IGetAllClientsUseCase } from '../interfaces/client-use-cases';

export class GetAllClientsUseCase implements IGetAllClientsUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(): Promise<ClientResponse[]> {
    const clients = await this.clientRepository.findAll();
    const responses = clients.map((client) => ({
      id: client.id || 0,
      name: client.name,
      email: client.email,
      balance: client.balance,
    }));

    // Validate response data array
    return validateData(z.array(clientResponseSchema), responses);
  }
}
