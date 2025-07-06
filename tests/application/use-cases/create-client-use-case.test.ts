import { CreateClientUseCase } from '../../../src/application/use-cases/create-client-use-case';
import { Client } from '../../../src/domain/entities/client';
import { DuplicateError } from '../../../src/domain/errors/domain-errors';
import { createMockClient, mockClientRepository } from '../../test-utils';

describe('CreateClientUseCase', () => {
  let useCase: CreateClientUseCase;
  let clientRepository: jest.Mocked<any>;

  beforeEach(() => {
    clientRepository = mockClientRepository();
    useCase = new CreateClientUseCase(clientRepository);
  });

  describe('execute', () => {
    it('should create client with valid data', async () => {
      const request = { name: 'John Doe', email: 'john@example.com' };
      const savedClient = createMockClient({ id: 1, name: 'John Doe', email: 'john@example.com' });
      const expectedResponse = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        balance: 1000,
      };

      clientRepository.findByEmail.mockResolvedValue(null);
      clientRepository.save.mockResolvedValue(savedClient);

      const result = await useCase.execute(request);

      expect(clientRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(clientRepository.save).toHaveBeenCalledWith(expect.any(Client));
      expect(result).toEqual(expectedResponse);
    });

    it('should throw DuplicateError if email already exists', async () => {
      const request = { name: 'John Doe', email: 'john@example.com' };
      const existingClient = createMockClient({ email: 'john@example.com' });

      clientRepository.findByEmail.mockResolvedValue(existingClient);

      await expect(useCase.execute(request)).rejects.toThrow(DuplicateError);
      expect(clientRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(clientRepository.save).not.toHaveBeenCalled();
    });
  });
});
