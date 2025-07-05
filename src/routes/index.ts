import express from 'express';
import { clientRoutes } from './client-routes';

const router = express.Router();

router.use('/', clientRoutes);

export { router as routes };
