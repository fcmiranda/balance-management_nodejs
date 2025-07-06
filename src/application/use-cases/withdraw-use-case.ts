import type { ClientRepository } from '../../domain/repositories/client-repository';
import { validateData } from '../../infrastructure/validation/middleware';
import {
  clientResponseSchema,
  withdrawRequestSchema,
} from '../../infrastructure/validation/schemas';
import type {
  ClientResponse,
  IWithdrawUseCase,
  WithdrawRequest,
} from '../interfaces/client-use-cases';

export class WithdrawUseCase implements IWithdrawUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(request: WithdrawRequest): Promise<ClientResponse> {
    // Validate input data
    const validatedRequest = validateData(withdrawRequestSchema, request);

    const client = await this.clientRepository.findById(validatedRequest.clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    client.withdraw(validatedRequest.amount);
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
