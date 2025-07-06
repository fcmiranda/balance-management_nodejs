import { AuthController } from '@controllers/auth-controller';
import { AuthMiddleware } from '@infrastructure/middleware/auth-middleware';
import { createAuthRateLimiter } from '@infrastructure/middleware/security-middleware';
import { validateBody } from '@infrastructure/validation/middleware';
import { loginSchema, registerSchema } from '@infrastructure/validation/schemas';
import express from 'express';

const router = express.Router();
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();

// Public routes (no authentication required)
router.post(
  '/login',
  createAuthRateLimiter(),
  validateBody(loginSchema),
  authController.login.bind(authController),
);

router.post(
  '/register',
  createAuthRateLimiter(),
  validateBody(registerSchema),
  authController.register.bind(authController),
);

// Protected routes (authentication required)
router.get('/me', authMiddleware.authenticate, authController.getCurrentUser.bind(authController));

router.post('/logout', authMiddleware.authenticate, authController.logout.bind(authController));

export { router as authRoutes };
