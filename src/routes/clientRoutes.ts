import express from 'express';
import { ClientController } from '../controllers/clientController';

const router = express.Router();

// Client routes
router.get('/clients', ClientController.getAllClients);
router.get('/clients/:id', ClientController.getClientById);
router.post('/clients', ClientController.createClient);
router.put('/clients/:id', ClientController.updateClient);
router.delete('/clients/:id', ClientController.deleteClient);

// Client operations routes
router.post('/clients/:id/deposit', ClientController.deposit);
router.post('/clients/:id/withdraw', ClientController.withdraw);

export { router as clientRoutes };
