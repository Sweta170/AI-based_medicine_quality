import express from 'express';
import { updateCustomerReminder } from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.put('/:id/reminders', updateCustomerReminder);

export default router;
