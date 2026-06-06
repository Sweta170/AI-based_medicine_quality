import Medicine from '../models/Medicine.js';

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Private
export const getAllMedicines = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({}).sort({ name: 1 });
    res.json(medicines);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new medicine
// @route   POST /api/medicines
// @access  Private/Pharmacist,Superadmin
export const createMedicine = async (req, res, next) => {
  const { name, description, category, price, stock, expiryDate, manufacturer } = req.body;

  try {
    const medicine = await Medicine.create({
      name,
      description,
      category,
      price,
      stock,
      expiryDate,
      manufacturer,
    });

    res.status(201).json(medicine);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a medicine
// @route   PUT /api/medicines/:id
// @access  Private/Pharmacist,Superadmin
export const updateMedicine = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, category, price, stock, expiryDate, manufacturer } = req.body;

  try {
    const medicine = await Medicine.findById(id);

    if (!medicine) {
      res.status(404);
      throw new Error('Medicine not found');
    }

    medicine.name = name !== undefined ? name : medicine.name;
    medicine.description = description !== undefined ? description : medicine.description;
    medicine.category = category !== undefined ? category : medicine.category;
    medicine.price = price !== undefined ? price : medicine.price;
    medicine.stock = stock !== undefined ? stock : medicine.stock;
    medicine.expiryDate = expiryDate !== undefined ? expiryDate : medicine.expiryDate;
    medicine.manufacturer = manufacturer !== undefined ? manufacturer : medicine.manufacturer;

    const updatedMedicine = await medicine.save();
    res.json(updatedMedicine);
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
