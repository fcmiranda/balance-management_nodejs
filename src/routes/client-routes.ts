import { ClientController } from '@controllers/client-controller';
import { AuthMiddleware } from '@infrastructure/middleware/auth-middleware';
import { validateBody, validateParams } from '@infrastructure/validation/middleware';
import {
  clientIdParamSchema,
  createClientRequestSchema,
  depositRequestSchema,
  updateClientRequestSchema,
  withdrawRequestSchema,
} from '@infrastructure/validation/schemas';
import express from 'express';

const router = express.Router();
const clientController = new ClientController();
const authMiddleware = new AuthMiddleware();

// Routes with authentication and validation middleware
router.get(
  '/clients',
  authMiddleware.authenticate,
  clientController.getAllClients.bind(clientController),
);

router.get(
  '/clients/:id',
  authMiddleware.authenticate,
  validateParams(clientIdParamSchema),
  clientController.getClientById.bind(clientController),
);

router.post(
  '/clients',
  authMiddleware.authenticate,
  authMiddleware.authorize(['admin']), // Only admins can create clients
  validateBody(createClientRequestSchema),
  clientController.createClient.bind(clientController),
);

router.put(
  '/clients/:id',
  authMiddleware.authenticate,
  authMiddleware.authorize(['admin']), // Only admins can update clients
  validateParams(clientIdParamSchema),
  validateBody(updateClientRequestSchema),
  clientController.updateClient.bind(clientController),
);

router.delete(
  '/clients/:id',
  authMiddleware.authenticate,
  authMiddleware.authorize(['admin']), // Only admins can delete clients
  validateParams(clientIdParamSchema),
  clientController.deleteClient.bind(clientController),
);

// For deposit and withdraw, we only need amount in body since client ID comes from params
router.post(
  '/clients/:id/deposit',
  authMiddleware.authenticate,
  authMiddleware.authorize(['admin', 'client']), // Both admin and client can deposit
  validateParams(clientIdParamSchema),
  validateBody(depositRequestSchema.omit({ clientId: true })),
  clientController.deposit.bind(clientController),
);

router.post(
  '/clients/:id/withdraw',
  authMiddleware.authenticate,
  authMiddleware.authorize(['admin', 'client']), // Both admin and client can withdraw
  validateParams(clientIdParamSchema),
  validateBody(withdrawRequestSchema.omit({ clientId: true })),
  clientController.withdraw.bind(clientController),
);

export { router as clientRoutes };
