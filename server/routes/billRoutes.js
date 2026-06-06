import express from 'express';
import {
  createBill,
  getCustomerBills,
  generateBillPDF,
  getAllBills,
} from '../controllers/billController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All billing endpoints require authentication
router.use(protect);

router.post('/', createBill);
router.get('/', authorize('superadmin', 'pharmacist'), getAllBills);
router.get('/customer/:customerId', getCustomerBills);
router.get('/:id/pdf', generateBillPDF);

export default router;
