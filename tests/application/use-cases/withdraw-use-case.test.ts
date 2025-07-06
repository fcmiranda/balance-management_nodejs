import { WithdrawUseCase } from '../../../src/application/use-cases/withdraw-use-case';
import { Client } from '../../../src/domain/entities/client';
import { NotFoundError } from '../../../src/domain/errors/domain-errors';
import { mockClientRepository, createMockClient } from '../../test-utils';

describe('WithdrawUseCase', () => {
  let useCase: WithdrawUseCase;
  let clientRepository: jest.Mocked<any>;

  beforeEach(() => {
    clientRepository = mockClientRepository();
    useCase = new WithdrawUseCase(clientRepository);
  });

  describe('execute', () => {
    it('should withdraw amount from client account', async () => {
      const request = { clientId: 1, amount: 300 };
      const existingClient = createMockClient({ id: 1, balance: 1000 });
      const updatedClient = createMockClient({ id: 1, balance: 700 });
      const expectedResponse = { id: 1, name: 'Test Client', email: 'test@example.com', balance: 700 };

      clientRepository.findById.mockResolvedValue(existingClient);
      clientRepository.update.mockResolvedValue(updatedClient);

      const result = await useCase.execute(request);

      expect(clientRepository.findById).toHaveBeenCalledWith(1);
      expect(clientRepository.update).toHaveBeenCalledWith(expect.any(Client));
      expect(result).toEqual(expectedResponse);
    });

    it('should throw NotFoundError if client does not exist', async () => {
      const request = { clientId: 999, amount: 300 };

      clientRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(request)).rejects.toThrow(NotFoundError);
      expect(clientRepository.findById).toHaveBeenCalledWith(999);
      expect(clientRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error for insufficient balance', async () => {
      const request = { clientId: 1, amount: 1500 };
      const existingClient = createMockClient({ id: 1, balance: 1000 });

      clientRepository.findById.mockResolvedValue(existingClient);

      await expect(useCase.execute(request)).rejects.toThrow('Insufficient balance');
      expect(clientRepository.findById).toHaveBeenCalledWith(1);
      expect(clientRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error for invalid withdrawal amount', async () => {
      const request = { clientId: 1, amount: -100 };
      const existingClient = createMockClient({ id: 1, balance: 1000 });

      clientRepository.findById.mockResolvedValue(existingClient);

      await expect(useCase.execute(request)).rejects.toThrow();
      expect(clientRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error for zero withdrawal amount', async () => {
      const request = { clientId: 1, amount: 0 };
      const existingClient = createMockClient({ id: 1, balance: 1000 });

      clientRepository.findById.mockResolvedValue(existingClient);

      await expect(useCase.execute(request)).rejects.toThrow();
      expect(clientRepository.update).not.toHaveBeenCalled();
    });
  });
});
