import express from 'express';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes here require being logged in and having the 'superadmin' role
router.use(protect);
router.use(authorize('superadmin'));

router.route('/').get(getAllUsers);
router.route('/:id/role').put(updateUserRole);
router.route('/:id').delete(deleteUser);

export default router;
