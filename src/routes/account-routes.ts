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
import { DIFactory } from '../infrastructure/di/di-factory';

const router = express.Router();
const diFactory = DIFactory.getInstance();
const accountController = diFactory.createAccountController();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Account management endpoints
 */

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAccountRequest'
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Routes with authentication and validation middleware
router.post(
  '/accounts',
  authMiddleware.authenticate,
  authMiddleware.authorize(['client']), // Only clients can create accounts
  validateBody(createAccountRequestSchema),
  accountController.createAccount.bind(accountController),
);

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Get user accounts
 *     tags: [Accounts]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/accounts',
  authMiddleware.authenticate,
  authMiddleware.authorize(['client']), // Only clients can view their own accounts
  accountController.getUserAccounts.bind(accountController),
);

/**
 * @swagger
 * /accounts/{accountId}/deposit:
 *   post:
 *     summary: Deposit money to account
 *     tags: [Accounts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionRequest'
 *     responses:
 *       200:
 *         description: Deposit successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/accounts/:accountId/deposit',
  authMiddleware.authenticate,
  authMiddleware.authorize(['client']), // Only clients can deposit to their own accounts
  validateParams(accountIdParamSchema),
  validateBody(accountDepositRequestSchema),
  accountController.deposit.bind(accountController),
);

/**
 * @swagger
 * /accounts/{accountId}/withdraw:
 *   post:
 *     summary: Withdraw money from account
 *     tags: [Accounts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionRequest'
 *     responses:
 *       200:
 *         description: Withdrawal successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Invalid request data or insufficient funds
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/accounts/:accountId/withdraw',
  authMiddleware.authenticate,
  authMiddleware.authorize(['client']), // Only clients can withdraw from their own accounts
  validateParams(accountIdParamSchema),
  validateBody(accountWithdrawRequestSchema),
  accountController.withdraw.bind(accountController),
);

export { router as accountRoutes };
