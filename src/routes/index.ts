import express from 'express';
import { authRoutes } from './auth-routes';
import { clientRoutes } from './client-routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/', clientRoutes);

export { router as routes };
