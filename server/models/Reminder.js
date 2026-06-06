import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medicineName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    time: {
      type: String,
      default: '10:00 AM',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Reminder = mongoose.model('Reminder', reminderSchema);

export default Reminder;
