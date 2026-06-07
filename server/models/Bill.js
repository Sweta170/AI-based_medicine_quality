import mongoose from 'mongoose';

const billItemSchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'UnitPrice cannot be negative'],
  },
  expiryStatus: {
    type: String,
    required: true,
    enum: ['EXPIRED', 'CRITICAL', 'WARNING', 'CAUTION', 'SAFE'],
  },
  expiryDate: {
    type: Date,
  },
});

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      unique: true,
    },
    pharmacistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    billType: {
      type: String,
      enum: ['ONLINE', 'INSTORE'],
      default: 'ONLINE',
    },
    guestPhone: {
      type: String,
      default: null,
    },
    items: [billItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative'],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Cash', 'Card', 'UPI'],
      default: 'Card',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-generate unique billNumber if not set
billSchema.pre('save', async function (next) {
  if (!this.billNumber) {
    const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    const randomCode = Math.floor(1000 + Math.random() * 9000); // 4 digit random
    this.billNumber = `BILL-${dateCode}-${randomCode}`;
  }
  next();
});

const Bill = mongoose.model('Bill', billSchema);

export default Bill;
