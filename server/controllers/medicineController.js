import Medicine from '../models/Medicine.js';
import { checkExpiryStatus } from '../utils/expiryCheck.js';

// @desc    Get all medicines (with filters)
// @route   GET /api/medicines
// @access  Private
export const getAllMedicines = async (req, res, next) => {
  const { search, category, status, reorder } = req.query;

  try {
    const query = {};

    // 1. Search filter (name, genericName, manufacturer)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
      ];
    }

    // 2. Category filter
    if (category) {
      query.category = category;
    }

    // 3. Expiry status filter
    if (status) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const msInDay = 24 * 60 * 60 * 1000;
      const thirtyDays = new Date(today.getTime() + 30 * msInDay);
      const sixtyDays = new Date(today.getTime() + 60 * msInDay);
      const ninetyDays = new Date(today.getTime() + 90 * msInDay);

      if (status === 'EXPIRED') {
        query.expiryDate = { $lt: today };
      } else if (status === 'CRITICAL') {
        query.expiryDate = { $gte: today, $lte: thirtyDays };
      } else if (status === 'WARNING') {
        query.expiryDate = { $gt: thirtyDays, $lte: sixtyDays };
      } else if (status === 'CAUTION') {
        query.expiryDate = { $gt: sixtyDays, $lte: ninetyDays };
      } else if (status === 'SAFE') {
        query.expiryDate = { $gt: ninetyDays };
      }
    }

    // 4. Reorder level filter (quantity <= reorderLevel)
    if (reorder === 'true') {
      query.$expr = { $lte: ['$quantity', '$reorderLevel'] };
    }

    const medicines = await Medicine.find(query)
      .populate('createdBy', 'name email')
      .sort({ name: 1 });

    // Append calculated status to each item for frontend convenience
    const medicinesWithStatus = medicines.map((med) => {
      const medObj = med.toObject();
      medObj.expiryStatus = checkExpiryStatus(med.expiryDate);
      return medObj;
    });

    res.json(medicinesWithStatus);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new medicine
// @route   POST /api/medicines
// @access  Private/Pharmacist,Superadmin
export const createMedicine = async (req, res, next) => {
  const {
    name,
    genericName,
    manufacturer,
    batchNumber,
    expiryDate,
    manufactureDate,
    quantity,
    reorderLevel,
    price,
    category,
    barcode,
    labelImageUrl,
  } = req.body;

  try {
    // Check if batchNumber already exists
    const batchExists = await Medicine.findOne({ batchNumber });
    if (batchExists) {
      res.status(400);
      throw new Error(`A medicine with batch number '${batchNumber}' already exists.`);
    }

    const medicine = await Medicine.create({
      name,
      genericName,
      manufacturer,
      batchNumber,
      expiryDate,
      manufactureDate,
      quantity,
      reorderLevel,
      price,
      category,
      barcode,
      labelImageUrl,
      createdBy: req.user._id,
    });

    const populatedMed = await Medicine.findById(medicine._id).populate('createdBy', 'name email');
    const medObj = populatedMed.toObject();
    medObj.expiryStatus = checkExpiryStatus(populatedMed.expiryDate);

    res.status(201).json(medObj);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a medicine
// @route   PUT /api/medicines/:id
// @access  Private/Pharmacist,Superadmin
export const updateMedicine = async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    genericName,
    manufacturer,
    batchNumber,
    expiryDate,
    manufactureDate,
    quantity,
    reorderLevel,
    price,
    category,
    barcode,
    labelImageUrl,
  } = req.body;

  try {
    const medicine = await Medicine.findById(id);

    if (!medicine) {
      res.status(404);
      throw new Error('Medicine not found');
    }

    // Check if batch number is being changed to an already existing one
    if (batchNumber && batchNumber !== medicine.batchNumber) {
      const batchExists = await Medicine.findOne({ batchNumber });
      if (batchExists) {
        res.status(400);
        throw new Error(`A medicine with batch number '${batchNumber}' already exists.`);
      }
      medicine.batchNumber = batchNumber;
    }

    medicine.name = name !== undefined ? name : medicine.name;
    medicine.genericName = genericName !== undefined ? genericName : medicine.genericName;
    medicine.manufacturer = manufacturer !== undefined ? manufacturer : medicine.manufacturer;
    medicine.expiryDate = expiryDate !== undefined ? expiryDate : medicine.expiryDate;
    medicine.manufactureDate = manufactureDate !== undefined ? manufactureDate : medicine.manufactureDate;
    medicine.quantity = quantity !== undefined ? quantity : medicine.quantity;
    medicine.reorderLevel = reorderLevel !== undefined ? reorderLevel : medicine.reorderLevel;
    medicine.price = price !== undefined ? price : medicine.price;
    medicine.category = category !== undefined ? category : medicine.category;
    medicine.barcode = barcode !== undefined ? barcode : medicine.barcode;
    medicine.labelImageUrl = labelImageUrl !== undefined ? labelImageUrl : medicine.labelImageUrl;

    const updatedMedicine = await medicine.save();
    const populatedMed = await Medicine.findById(updatedMedicine._id).populate('createdBy', 'name email');
    const medObj = populatedMed.toObject();
    medObj.expiryStatus = checkExpiryStatus(populatedMed.expiryDate);

    res.json(medObj);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a medicine
// @route   DELETE /api/medicines/:id
// @access  Private/Pharmacist,Superadmin
export const deleteMedicine = async (req, res, next) => {
  const { id } = req.params;

  try {
    const medicine = await Medicine.findById(id);

    if (!medicine) {
      res.status(404);
      throw new Error('Medicine not found');
    }

    await Medicine.findByIdAndDelete(id);
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk import medicines
// @route   POST /api/medicines/bulk
// @access  Private/Pharmacist,Superadmin
export const bulkImportMedicines = async (req, res, next) => {
  const medicineArray = req.body;

  if (!Array.isArray(medicineArray)) {
    res.status(400);
    return next(new Error('Payload must be a JSON array of medicines'));
  }

  try {
    let insertedCount = 0;
    let skippedCount = 0;
    const skippedBatches = [];

    for (const med of medicineArray) {
      const {
        name,
        genericName,
        manufacturer,
        batchNumber,
        expiryDate,
        manufactureDate,
        quantity,
        reorderLevel,
        price,
        category,
        barcode,
        labelImageUrl,
      } = med;

      // Ensure required fields
      if (!name || !genericName || !manufacturer || !batchNumber || !expiryDate || !manufactureDate || price === undefined) {
        skippedCount++;
        skippedBatches.push({ batchNumber: batchNumber || 'UNKNOWN', reason: 'Missing required fields' });
        continue;
      }

      // Check for duplicate batch number
      const batchExists = await Medicine.findOne({ batchNumber });
      if (batchExists) {
        skippedCount++;
        skippedBatches.push({ batchNumber, reason: 'Duplicate batch number' });
        continue;
      }

      await Medicine.create({
        name,
        genericName,
        manufacturer,
        batchNumber,
        expiryDate,
        manufactureDate,
        quantity: quantity || 0,
        reorderLevel: reorderLevel || 10,
        price,
        category,
        barcode,
        labelImageUrl,
        createdBy: req.user._id,
      });

      insertedCount++;
    }

    res.status(201).json({
      message: 'Bulk import complete',
      insertedCount,
      skippedCount,
      skippedDetails: skippedBatches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process a bill checkout and validate medicine statuses
// @route   POST /api/medicines/bill
// @access  Private
export const processBill = async (req, res, next) => {
  const { items } = req.body; // Array of { medicineId, quantity }

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    return next(new Error('Bill items list cannot be empty'));
  }

  try {
    // 1. Validate all items first
    const checkedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);

      if (!medicine) {
        res.status(404);
        return next(new Error(`Medicine with ID ${item.medicineId} not found`));
      }

      // Business Rule: If status is EXPIRED, throw 403 error
      const expiryStatus = checkExpiryStatus(medicine.expiryDate);
      if (expiryStatus === 'EXPIRED') {
        return res.status(403).json({
          message: 'This medicine is expired and cannot be billed',
          code: 'MEDICINE_EXPIRED',
          medicineName: medicine.name,
        });
      }

      // Check stock quantity
      if (medicine.quantity < item.quantity) {
        res.status(400);
        return next(new Error(`Insufficient stock for '${medicine.name}'. Available: ${medicine.quantity}, Requested: ${item.quantity}`));
      }

      subtotal += medicine.price * item.quantity;
      checkedItems.push({ medicine, requestedQty: item.quantity });
    }

    // 2. Perform transaction (decrement stock)
    for (const checked of checkedItems) {
      checked.medicine.quantity -= checked.requestedQty;
      await checked.medicine.save();
    }

    res.json({
      message: 'Bill processed successfully',
      billId: 'BILL-' + Math.floor(100000 + Math.random() * 900000),
      items: checkedItems.map(c => ({
        medicineId: c.medicine._id,
        name: c.medicine.name,
        quantity: c.requestedQty,
        price: c.medicine.price,
      })),
      subtotal,
    });
  } catch (error) {
    next(error);
  }
};
