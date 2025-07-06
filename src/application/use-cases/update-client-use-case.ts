import type { ClientRepository } from '../../domain/repositories/client-repository';
import { validateData } from '../../infrastructure/validation/middleware';
import {
  clientResponseSchema,
  updateClientRequestSchema,
} from '../../infrastructure/validation/schemas';
import type {
  ClientResponse,
  IUpdateClientUseCase,
  UpdateClientRequest,
} from '../interfaces/client-use-cases';

export class UpdateClientUseCase implements IUpdateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(request: UpdateClientRequest): Promise<ClientResponse> {
    // Validate input data
    const validatedRequest = validateData(updateClientRequestSchema, request);

    const client = await this.clientRepository.findById(validatedRequest.id);
    if (!client) {
      throw new Error('Client not found');
    }

    // Check if email is being changed and if it's already taken
    if (client.email !== validatedRequest.email) {
      const existingClient = await this.clientRepository.findByEmail(validatedRequest.email);
      if (existingClient && existingClient.id !== validatedRequest.id) {
        throw new Error('Email is already taken by another client');
      }
    }

    client.updateInfo(validatedRequest.name, validatedRequest.email);
    const updatedClient = await this.clientRepository.update(client);

    const response = {
      id: updatedClient.id || 0,
      name: updatedClient.name,
      email: updatedClient.email,
      balance: updatedClient.balance,
    };

    // Validate response data
    return validateData(clientResponseSchema, response);
  }
}
