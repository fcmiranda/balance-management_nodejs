import express from 'express';
import { clientRoutes } from './clientRoutes';

const router = express.Router();

router.use('/', clientRoutes);

export { router as routes };
