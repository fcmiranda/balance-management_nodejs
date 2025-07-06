import express from 'express';
import { accountRoutes } from './account-routes';
import { authRoutes } from './auth-routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/', accountRoutes);

export { router as routes };
