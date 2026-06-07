import express from 'express';
import {
  getNotificationHistory,
  createReminder,
  getCustomerReminders,
  deleteReminder,
  logBrowserNotification,
  triggerCron,
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// User reminder endpoints
router.post('/reminders', createReminder);
router.get('/reminders/customer/:customerId', getCustomerReminders);
router.delete('/reminders/:id', deleteReminder);

// Browser notification log endpoint
router.post('/browser-log', logBrowserNotification);

// History logs
router.get('/:userId', getNotificationHistory);

// Admin / Pharmacist Manual Cron Triggers
router.post('/trigger/:cronNumber', authorize('pharmacist', 'superadmin'), triggerCron);

export default router;
