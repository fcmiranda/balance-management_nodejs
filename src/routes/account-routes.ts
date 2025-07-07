import { AccountController } from '@controllers/account-controller';
import { AuthMiddleware } from '@infrastructure/middleware/auth-middleware';
import { validateBody, validateParams } from '@infrastructure/validation/middleware';
import {
  accountDepositRequestSchema,
  accountIdParamSchema,
  accountWithdrawRequestSchema,
  createAccountRequestSchema,
} from '@infrastructure/validation/schemas';
import express from 'express';

const router = express.Router();
const accountController = new AccountController();
const authMiddleware = new AuthMiddleware();

// Routes with authentication and validation middleware
router.post(
  '/accounts',
  authMiddleware.authenticate,
  authMiddleware.authorize(['client']), // Only clients can create accounts
  validateBody(createAccountRequestSchema),
  accountController.createAccount.bind(accountController),
);

router.get(
  '/accounts',
  authMiddleware.authenticate,
  authMiddleware.authorize(['client']), // Only clients can view their own accounts
  accountController.getUserAccounts.bind(accountController),
);

router.post(
  '/accounts/:accountId/deposit',
  authMiddleware.authenticate,
  authMiddleware.authorize(['client']), // Only clients can deposit to their own accounts
  validateParams(accountIdParamSchema),
  validateBody(accountDepositRequestSchema),
  accountController.deposit.bind(accountController),
);

router.post(
  '/accounts/:accountId/withdraw',
  authMiddleware.authenticate,
  authMiddleware.authorize(['client']), // Only clients can withdraw from their own accounts
  validateParams(accountIdParamSchema),
  validateBody(accountWithdrawRequestSchema),
  accountController.withdraw.bind(accountController),
);

export { router as accountRoutes };
