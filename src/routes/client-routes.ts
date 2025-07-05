import express from 'express';
import { ClientController } from '../controllers/client-controller';

const router = express.Router();
const clientController = new ClientController();

router.get('/clients', clientController.getAllClients.bind(clientController));
router.get('/clients/:id', clientController.getClientById.bind(clientController));
router.post('/clients', clientController.createClient.bind(clientController));
router.put('/clients/:id', clientController.updateClient.bind(clientController));
router.delete('/clients/:id', clientController.deleteClient.bind(clientController));

router.post('/clients/:id/deposit', clientController.deposit.bind(clientController));
router.post('/clients/:id/withdraw', clientController.withdraw.bind(clientController));

export { router as clientRoutes };
