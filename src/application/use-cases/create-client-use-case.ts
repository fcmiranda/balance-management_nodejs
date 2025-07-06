import { Client } from '../../domain/entities/client';
import type { ClientRepository } from '../../domain/repositories/client-repository';
import { validateData } from '../../infrastructure/validation/middleware';
import {
  clientResponseSchema,
  createClientRequestSchema,
} from '../../infrastructure/validation/schemas';
import type {
  ClientResponse,
  CreateClientRequest,
  ICreateClientUseCase,
} from '../interfaces/client-use-cases';

export class CreateClientUseCase implements ICreateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(request: CreateClientRequest): Promise<ClientResponse> {
    // Validate input data
    const validatedRequest = validateData(createClientRequestSchema, request);

    // Check if client with email already exists
    const existingClient = await this.clientRepository.findByEmail(validatedRequest.email);
    if (existingClient) {
      throw new Error('Client with this email already exists');
    }

    const client = Client.create(validatedRequest.name, validatedRequest.email);
    const savedClient = await this.clientRepository.save(client);

    const response = {
      id: savedClient.id || 0,
      name: savedClient.name,
      email: savedClient.email,
      balance: savedClient.balance,
    };

    // Validate response data
    return validateData(clientResponseSchema, response);
  }
}
