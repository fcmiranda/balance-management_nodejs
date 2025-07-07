import { UserController } from '@controllers/user-controller';
import { Container } from '@infrastructure/container';
import { authenticateToken } from '@infrastructure/middleware/auth-middleware';
import { validateRequest } from '@infrastructure/validation/middleware';
import {
  createUserRequestSchema,
  updateUserRequestSchema,
} from '@infrastructure/validation/schemas';
import { Router } from 'express';

const router = Router();
const container = Container.getInstance();
const userController = new UserController(container);

/**
 * @route   GET /users/:id
 * @desc    Get user details by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, (req, res) => {
  userController.getUserById(req, res);
});

/**
 * @route   POST /users
 * @desc    Create a new user
 * @access  Private (Admin only)
 */
router.post('/', authenticateToken, validateRequest(createUserRequestSchema), (req, res) => {
  // Only admin can create users
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Admin role required.' });
    return;
  }

  userController.createUser(req, res);
});

/**
 * @route   PUT /users/:id
 * @desc    Update user details
 * @access  Private (Admin or own user)
 */
router.put('/:id', authenticateToken, validateRequest(updateUserRequestSchema), (req, res) => {
  const userId = Number.parseInt(req.params.id);

  // Users can only update their own profile, or admin can update any user
  if (req.user?.role !== 'admin' && req.user?.userId !== userId) {
    res.status(403).json({ error: 'Access denied. You can only update your own profile.' });
    return;
  }

  userController.updateUser(req, res);
});

/**
 * @route   DELETE /users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticateToken, (req, res) => {
  // Only admin can delete users
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Admin role required.' });
    return;
  }

  userController.deleteUser(req, res);
});

export default router;
