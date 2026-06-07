import Bill from '../models/Bill.js';
import Medicine from '../models/Medicine.js';
import User from '../models/User.js';
import { checkExpiryStatus } from '../utils/expiryCheck.js';
import PDFDocument from 'pdfkit';

// @desc    Create a new bill
// @route   POST /api/bills
// @access  Private
export const createBill = async (req, res, next) => {
  const { customerId, items, discount, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    return next(new Error('Bill items list cannot be empty'));
  }

  try {
    // Determine customerId and pharmacistId based on role
    let finalCustomerId = customerId;
    let finalPharmacistId = null;

    if (req.user.role === 'customer') {
      finalCustomerId = req.user._id;
    } else {
      // Pharmacist or admin creating the bill
      finalPharmacistId = req.user._id;
      if (!finalCustomerId) {
        res.status(400);
        return next(new Error('Customer ID is required for pharmacists to create a bill'));
      }
    }

    // Verify customer exists
    const customer = await User.findById(finalCustomerId);
    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found'));
    }

    const expiredItems = [];
    const insufficientStockItems = [];
    const validatedItems = [];
    let subtotal = 0;

    // 1. Loop through each item and check validations
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);

      if (!medicine) {
        res.status(404);
        return next(new Error(`Medicine with ID ${item.medicineId} not found`));
      }

      // Check Expiry Status
      const expiryStatus = checkExpiryStatus(medicine.expiryDate);
      if (expiryStatus === 'EXPIRED') {
        expiredItems.push(`${medicine.name} (Batch: ${medicine.batchNumber})`);
      }

      // Check Stock Availability
      if (medicine.quantity < item.quantity) {
        insufficientStockItems.push(
          `${medicine.name} (Requested: ${item.quantity}, Available: ${medicine.quantity})`
        );
      }

      subtotal += medicine.price * item.quantity;

      validatedItems.push({
        medicineId: medicine._id,
        name: medicine.name,
        quantity: item.quantity,
        unitPrice: medicine.price,
        expiryStatus,
        ref: medicine, // keep ref to update stock later
      });
    }

    // 2. Reject if any item is expired
    if (expiredItems.length > 0) {
      return res.status(403).json({
        message: `Billing rejected. The following medicines are expired and cannot be billed: ${expiredItems.join(', ')}`,
        code: 'MEDICINE_EXPIRED',
        expiredMedicines: expiredItems,
      });
    }

    // 3. Reject if any item has insufficient stock
    if (insufficientStockItems.length > 0) {
      res.status(400);
      return next(
        new Error(
          `Billing rejected due to insufficient stock levels: ${insufficientStockItems.join(', ')}`
        )
      );
    }

    // 4. Calculate total
    const finalDiscount = Number(discount) || 0;
    const total = Math.max(0, subtotal - finalDiscount);

    // 5. Create the Bill record
    const bill = await Bill.create({
      pharmacistId: finalPharmacistId,
      customerId: finalCustomerId,
      items: validatedItems.map((item) => ({
        medicineId: item.medicineId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        expiryStatus: item.expiryStatus,
      })),
      subtotal,
      discount: finalDiscount,
      total,
      paymentMethod: paymentMethod || 'Card',
    });

    // 6. Automatically reduce stock quantity in Medicine collection
    for (const item of validatedItems) {
      item.ref.quantity -= item.quantity;
      await item.ref.save();
    }

    const populatedBill = await Bill.findById(bill._id)
      .populate('customerId', 'name email')
      .populate('pharmacistId', 'name email');

    res.status(201).json(populatedBill);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bills for a specific customer
// @route   GET /api/bills/customer/:customerId
// @access  Private
export const getCustomerBills = async (req, res, next) => {
  const { customerId } = req.params;

  try {
    // Security check: Customers can only view their own bills
    if (req.user.role === 'customer' && req.user._id.toString() !== customerId) {
      res.status(403);
      throw new Error('Not authorized to access this customer billing history');
    }

    const bills = await Bill.find({ customerId })
      .populate('customerId', 'name email')
      .populate('pharmacistId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (error) {
    next(error);
  }
};

// @desc    Generate downloadable PDF Invoice for a bill
// @route   GET /api/bills/:id/pdf
// @access  Private
export const generateBillPDF = async (req, res, next) => {
  const { id } = req.params;

  try {
    const bill = await Bill.findById(id).populate('customerId', 'name email phone');

    if (!bill) {
      res.status(404);
      throw new Error('Bill not found');
    }

    // Security check: Customers can only download their own PDFs
    if (req.user.role === 'customer' && req.user._id.toString() !== bill.customerId._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to download this invoice');
    }

    // Configure headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${bill.billNumber}.pdf`);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Pipe PDF directly to response stream
    doc.pipe(res);

    // --- Header Brand ---
    doc
      .fillColor('#0ea5e9')
      .fontSize(22)
      .text('PHARMADESK', 50, 45, { align: 'left' })
      .fillColor('#64748b')
      .fontSize(10)
      .text('Intelligent Pharmacy & Batch Portal', 50, 70, { align: 'left' })
      .moveDown();

    // Invoice Title
    doc
      .fillColor('#0f172a')
      .fontSize(18)
      .text('INVOICE / RECEIPT', 300, 45, { align: 'right', width: 245 })
      .fontSize(10)
      .fillColor('#475569')
      .text(`Invoice No: ${bill.billNumber}`, 300, 68, { align: 'right', width: 245 })
      .text(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`, 300, 83, { align: 'right', width: 245 })
      .text(`Payment: ${bill.paymentMethod}`, 300, 98, { align: 'right', width: 245 })
      .moveDown();

    // Divider Line
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 120).lineTo(550, 120).stroke();

    // Client/Customer Information
    doc
      .fillColor('#0f172a')
      .fontSize(12)
      .text('Billed To:', 50, 140, { bold: true })
      .fontSize(10)
      .fillColor('#475569')
      .text(`Name: ${bill.customerId.name}`, 50, 160)
      .text(`Email: ${bill.customerId.email}`, 50, 175)
      .text(`Phone: ${bill.customerId.phone || 'N/A'}`, 50, 190)
      .moveDown(2);

    // --- Table Headers ---
    let tableTop = 220;
    doc
      .fillColor('#0f172a')
      .fontSize(10)
      .text('Medicine Details', 50, tableTop, { bold: true })
      .text('Expiry Status', 240, tableTop, { bold: true })
      .text('Unit Price', 340, tableTop, { bold: true, align: 'right', width: 60 })
      .text('Quantity', 420, tableTop, { bold: true, align: 'right', width: 50 })
      .text('Total', 500, tableTop, { bold: true, align: 'right', width: 50 });

    // Header underline
    doc.strokeColor('#94a3b8').lineWidth(1).moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // --- Table Body ---
    let y = tableTop + 25;
    bill.items.forEach((item) => {
      // Draw rows
      doc
        .fillColor('#334155')
        .text(item.name, 50, y, { width: 180 })
        .text(item.expiryStatus, 240, y)
        .text(`Rs. ${item.unitPrice.toFixed(2)}`, 340, y, { align: 'right', width: 60 })
        .text(item.quantity.toString(), 420, y, { align: 'right', width: 50 })
        .text(`Rs. ${(item.unitPrice * item.quantity).toFixed(2)}`, 500, y, { align: 'right', width: 50 });

      y += 20;
    });

    // Subtotal Section
    const subtotalY = y + 15;
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(340, subtotalY).lineTo(550, subtotalY).stroke();

    doc
      .fillColor('#475569')
      .fontSize(10)
      .text('Subtotal:', 340, subtotalY + 10, { align: 'right', width: 130 })
      .text(`Rs. ${bill.subtotal.toFixed(2)}`, 480, subtotalY + 10, { align: 'right', width: 70 })

      .text('Discount Applied:', 340, subtotalY + 25, { align: 'right', width: 130 })
      .text(`-Rs. ${bill.discount.toFixed(2)}`, 480, subtotalY + 25, { align: 'right', width: 70 })

      .fillColor('#0ea5e9')
      .fontSize(12)
      .text('Grand Total:', 340, subtotalY + 45, { bold: true, align: 'right', width: 130 })
      .text(`Rs. ${bill.total.toFixed(2)}`, 480, subtotalY + 45, { bold: true, align: 'right', width: 70 });

    // --- Footer ---
    doc
      .fillColor('#64748b')
      .fontSize(9)
      .text(
        'Thank you for choosing Pharmadesk. Wishing you strong health!',
        50,
        720,
        { align: 'center', width: 500 }
      )
      .fontSize(7)
      .text(
        'This is a computer-generated transaction invoice and requires no physical signatures.',
        50,
        735,
        { align: 'center', width: 500 }
      );

    // End Document
    doc.end();
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bills (Pharmacist and Admin only)
// @route   GET /api/bills
// @access  Private
export const getAllBills = async (req, res, next) => {
  try {
    if (req.user.role === 'customer') {
      res.status(403);
      throw new Error('Not authorized to access all billing history');
    }

    const bills = await Bill.find({})
      .populate('customerId', 'name email')
      .populate('pharmacistId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (error) {
    next(error);
  }
};
