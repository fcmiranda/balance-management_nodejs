import type { ClientRepository } from '../../domain/repositories/client-repository';
import type {
  ClientResponse,
  GetClientByIdRequest,
  IGetClientByIdUseCase,
} from '../interfaces/client-use-cases';

export class GetClientByIdUseCase implements IGetClientByIdUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(request: GetClientByIdRequest): Promise<ClientResponse | null> {
    const client = await this.clientRepository.findById(request.id);

    if (!client) {
      return null;
    }

    return {
      id: client.id || 0,
      name: client.name,
      email: client.email,
      balance: client.balance,
    };
  }
}
