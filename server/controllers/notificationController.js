import Notification from '../models/Notification.js';
import Reminder from '../models/Reminder.js';
import User from '../models/User.js';
import { runExpiryReport, runLowStockReport, runEmailReminders } from '../utils/notificationScheduler.js';

// @desc    Get notification history for a specific user
// @route   GET /api/notifications/:userId
// @access  Private
export const getNotificationHistory = async (req, res, next) => {
  const { userId } = req.params;

  try {
    // Security check: Customers can only fetch their own notification logs
    if (req.user.role === 'customer' && req.user._id.toString() !== userId) {
      res.status(403);
      throw new Error('Not authorized to access these notification logs');
    }

    const logs = await Notification.find({ recipientId: userId })
      .populate('recipientId', 'name email')
      .sort({ sentAt: -1 });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a customer medication reminder
// @route   POST /api/notifications/reminders
// @access  Private
export const createReminder = async (req, res, next) => {
  const { medicineName, phoneNumber, time } = req.body;

  if (!medicineName || !phoneNumber) {
    res.status(400);
    return next(new Error('Medicine name and phone number are required'));
  }

  try {
    const reminder = await Reminder.create({
      customerId: req.user._id,
      medicineName,
      phoneNumber,
      time: time || '10:00 AM',
    });

    res.status(201).json(reminder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get active reminders for a customer
// @route   GET /api/notifications/reminders/customer/:customerId
// @access  Private
export const getCustomerReminders = async (req, res, next) => {
  const { customerId } = req.params;

  try {
    // Security check
    if (req.user.role === 'customer' && req.user._id.toString() !== customerId) {
      res.status(403);
      throw new Error('Not authorized to view these reminders');
    }

    const reminders = await Reminder.find({ customerId }).sort({ createdAt: -1 });
    res.json(reminders);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a reminder
// @route   DELETE /api/notifications/reminders/:id
// @access  Private
export const deleteReminder = async (req, res, next) => {
  const { id } = req.params;

  try {
    const reminder = await Reminder.findById(id);

    if (!reminder) {
      res.status(404);
      throw new Error('Reminder not found');
    }

    // Security check
    if (req.user.role === 'customer' && req.user._id.toString() !== reminder.customerId.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this reminder');
    }

    await Reminder.findByIdAndDelete(id);
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Log a browser notification that was shown to the customer
// @route   POST /api/notifications/browser-log
// @access  Private
export const logBrowserNotification = async (req, res, next) => {
  const { medicineName } = req.body;

  if (!medicineName) {
    res.status(400);
    return next(new Error('Medicine name is required'));
  }

  try {
    const messageText = `Pharmadesk Reminder: Time to take your ${medicineName}. Keep healthy!`;

    const log = await Notification.create({
      recipientId: req.user._id,
      type: 'Browser',
      message: messageText,
      status: 'sent',
    });

    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
};

// @desc    Manually trigger scheduled cron jobs for verification
// @route   POST /api/notifications/trigger/:cronNumber
// @access  Private/Pharmacist,Superadmin
export const triggerCron = async (req, res, next) => {
  const { cronNumber } = req.params;

  try {
    let result;

    if (cronNumber === '1') {
      result = await runExpiryReport();
    } else if (cronNumber === '2') {
      result = await runLowStockReport();
    } else if (cronNumber === '3') {
      result = await runEmailReminders();
    } else {
      res.status(400);
      throw new Error('Invalid cron job number specified. Choose 1, 2, or 3.');
    }

    if (result.status === 'error') {
      res.status(500);
      throw new Error(result.error || 'Trigger failed');
    }

    res.json({
      message: `Cron job ${cronNumber} triggered successfully`,
      details: result,
    });
  } catch (error) {
    next(error);
  }
};
