import express from 'express';
import { ClienteController } from '../controllers/clienteController';

const router = express.Router();

// Cliente routes
router.get('/clientes', ClienteController.getAllClientes);
router.get('/clientes/:id', ClienteController.getClienteById);
router.post('/clientes', ClienteController.createCliente);
router.put('/clientes/:id', ClienteController.updateCliente);
router.delete('/clientes/:id', ClienteController.deleteCliente);

// Cliente operations routes
router.post('/clientes/:id/deposit', ClienteController.deposit);
router.post('/clientes/:id/withdraw', ClienteController.withdraw);

export { router as clienteRoutes };
