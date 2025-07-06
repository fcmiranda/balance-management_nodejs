import { GetAllClientsUseCase } from '../../../src/application/use-cases/get-all-clients-use-case';
import { mockClientRepository, createMockClient } from '../../test-utils';

describe('GetAllClientsUseCase', () => {
  let useCase: GetAllClientsUseCase;
  let clientRepository: jest.Mocked<any>;

  beforeEach(() => {
    clientRepository = mockClientRepository();
    useCase = new GetAllClientsUseCase(clientRepository);
  });

  describe('execute', () => {
    it('should return all clients', async () => {
      const mockClients = [
        createMockClient({ id: 1, name: 'John Doe', email: 'john@example.com' }),
        createMockClient({ id: 2, name: 'Jane Doe', email: 'jane@example.com' }),
      ];

      const expectedResponse = [
        { id: 1, name: 'John Doe', email: 'john@example.com', balance: 1000 },
        { id: 2, name: 'Jane Doe', email: 'jane@example.com', balance: 1000 },
      ];

      clientRepository.findAll.mockResolvedValue(mockClients);

      const result = await useCase.execute();

      expect(clientRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it('should return empty array when no clients exist', async () => {
      clientRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(clientRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      clientRepository.findAll.mockRejectedValue(error);

      await expect(useCase.execute()).rejects.toThrow('Database error');
      expect(clientRepository.findAll).toHaveBeenCalled();
    });
  });
});
