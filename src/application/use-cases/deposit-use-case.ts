import type { ClientRepository } from '../../domain/repositories/client-repository';
import { validateData } from '../../infrastructure/validation/middleware';
import {
  clientResponseSchema,
  depositRequestSchema,
} from '../../infrastructure/validation/schemas';
import type {
  ClientResponse,
  DepositRequest,
  IDepositUseCase,
} from '../interfaces/client-use-cases';

export class DepositUseCase implements IDepositUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(request: DepositRequest): Promise<ClientResponse> {
    // Validate input data
    const validatedRequest = validateData(depositRequestSchema, request);

    const client = await this.clientRepository.findById(validatedRequest.clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    client.deposit(validatedRequest.amount);
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
