import express from 'express';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getCustomers,
  updateProfileNameOrPhone,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Authentication middleware is required for all routes
router.use(protect);

// Pharmacists and Superadmins can list customers
router.get('/customers', authorize('superadmin', 'pharmacist'), getCustomers);

// Any logged-in user can update their name/phone
router.patch('/profile', updateProfileNameOrPhone);

// Rest of the routes are restricted to superadmin only
router.use(authorize('superadmin'));

router.route('/').get(getAllUsers);
router.route('/:id/role').put(updateUserRole);
router.route('/:id').delete(deleteUser);

export default router;
