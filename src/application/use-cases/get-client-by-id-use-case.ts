import type { ClientRepository } from '../../domain/repositories/client-repository';
import { validateData } from '../../infrastructure/validation/middleware';
import {
  clientResponseSchema,
  getClientByIdRequestSchema,
} from '../../infrastructure/validation/schemas';
import type {
  ClientResponse,
  GetClientByIdRequest,
  IGetClientByIdUseCase,
} from '../interfaces/client-use-cases';

export class GetClientByIdUseCase implements IGetClientByIdUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(request: GetClientByIdRequest): Promise<ClientResponse | null> {
    // Validate input data
    const validatedRequest = validateData(getClientByIdRequestSchema, request);

    const client = await this.clientRepository.findById(validatedRequest.id);

    if (!client) {
      return null;
    }

    const response = {
      id: client.id || 0,
      name: client.name,
      email: client.email,
      balance: client.balance,
    };

    // Validate response data
    return validateData(clientResponseSchema, response);
  }
}
