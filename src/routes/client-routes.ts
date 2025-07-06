import express from 'express';
import { ClientController } from '../controllers/client-controller';
import { validateBody, validateParams } from '../infrastructure/validation/middleware';
import {
  clientIdParamSchema,
  createClientRequestSchema,
  depositRequestSchema,
  updateClientRequestSchema,
  withdrawRequestSchema,
} from '../infrastructure/validation/schemas';

const router = express.Router();
const clientController = new ClientController();

// Routes with validation middleware
router.get('/clients', clientController.getAllClients.bind(clientController));
router.get(
  '/clients/:id',
  validateParams(clientIdParamSchema),
  clientController.getClientById.bind(clientController),
);
router.post(
  '/clients',
  validateBody(createClientRequestSchema),
  clientController.createClient.bind(clientController),
);
router.put(
  '/clients/:id',
  validateParams(clientIdParamSchema),
  validateBody(updateClientRequestSchema),
  clientController.updateClient.bind(clientController),
);
router.delete(
  '/clients/:id',
  validateParams(clientIdParamSchema),
  clientController.deleteClient.bind(clientController),
);

// For deposit and withdraw, we only need amount in body since client ID comes from params
router.post(
  '/clients/:id/deposit',
  validateParams(clientIdParamSchema),
  validateBody(depositRequestSchema.omit({ clientId: true })),
  clientController.deposit.bind(clientController),
);
router.post(
  '/clients/:id/withdraw',
  validateParams(clientIdParamSchema),
  validateBody(withdrawRequestSchema.omit({ clientId: true })),
  clientController.withdraw.bind(clientController),
);

export { router as clientRoutes };
