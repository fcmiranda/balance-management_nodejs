import express from 'express';
import { clienteRoutes } from './clienteRoutes';

const router = express.Router();

router.use('/', clienteRoutes);

export { router as routes };
