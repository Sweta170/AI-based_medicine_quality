import Reminder from '../models/Reminder.js';

// @desc    Update a customer medication reminder (toggle status or update time)
// @route   PUT /api/customers/:id/reminders
// @access  Private
export const updateCustomerReminder = async (req, res, next) => {
  const { id } = req.params; // customer ID
  const { reminderId, isActive, time } = req.body;

  if (!reminderId) {
    res.status(400);
    return next(new Error('Reminder ID is required for updates'));
  }

  try {
    const reminder = await Reminder.findById(reminderId);

    if (!reminder) {
      res.status(404);
      throw new Error('Reminder record not found');
    }

    // Security check: Verify request owner matches reminder customer or is administrator
    if (req.user.role === 'customer' && req.user._id.toString() !== id) {
      res.status(403);
      throw new Error('Not authorized to access this customer profile');
    }

    if (reminder.customerId.toString() !== id) {
      res.status(403);
      throw new Error('Reminder does not belong to the specified customer');
    }

    reminder.isActive = isActive !== undefined ? isActive : reminder.isActive;
    reminder.time = time !== undefined ? time : reminder.time;

    const updatedReminder = await reminder.save();
    res.json(updatedReminder);
  } catch (error) {
    next(error);
  }
};
