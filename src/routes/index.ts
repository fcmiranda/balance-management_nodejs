import express from 'express';
import { accountRoutes } from './account-routes';
import { authRoutes } from './auth-routes';
import userRoutes from './user-routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/', accountRoutes);

export { router as routes };
