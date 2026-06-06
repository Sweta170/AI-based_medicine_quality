import express from 'express';
import {
  createBill,
  getCustomerBills,
  generateBillPDF,
} from '../controllers/billController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All billing endpoints require authentication
router.use(protect);

router.post('/', createBill);
router.get('/customer/:customerId', getCustomerBills);
router.get('/:id/pdf', generateBillPDF);

export default router;
