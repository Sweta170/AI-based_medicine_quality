import express from 'express';
import {
  createBill,
  getCustomerBills,
  generateBillPDF,
  getAllBills,
  getBillById,
  lookupCustomerByPhone,
  createInstoreBill,
} from '../controllers/billController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All billing endpoints require authentication
router.use(protect);

router.get('/lookup-customer', lookupCustomerByPhone);
router.post('/instore', authorize('superadmin', 'pharmacist'), createInstoreBill);
router.post('/', createBill);
router.get('/', authorize('superadmin', 'pharmacist'), getAllBills);
router.get('/customer/:customerId', getCustomerBills);
router.get('/:id', getBillById);
router.get('/:id/pdf', generateBillPDF);

export default router;
