import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a medicine name'],
      trim: true,
    },
    genericName: {
      type: String,
      required: [true, 'Please add a generic name'],
      trim: true,
    },
    manufacturer: {
      type: String,
      required: [true, 'Please add a manufacturer'],
      trim: true,
    },
    batchNumber: {
      type: String,
      required: [true, 'Please add a batch number'],
      unique: true,
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please add an expiry date'],
    },
    manufactureDate: {
      type: Date,
      required: [true, 'Please add a manufacture date'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please add a quantity'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Please add a reorder level'],
      min: [0, 'Reorder level cannot be negative'],
      default: 10,
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
    },
    labelImageUrl: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing is handled by unique: true on the field definition
const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
