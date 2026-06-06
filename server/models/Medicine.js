import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a medicine name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Please add stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please add an expiry date'],
    },
    manufacturer: {
      type: String,
      trim: true,
      default: 'Generic',
    },
  },
  {
    timestamps: true,
  }
);

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
