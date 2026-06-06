import express from 'express';
import {
  getAllMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  bulkImportMedicines,
  processBill,
  scanLabel,
} from '../controllers/medicineController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Billing check - accessible by any authenticated role
router.post('/bill', processBill);

// OCR Label scanning - restricted to pharmacist or superadmin
router.post(
  '/scan-label',
  authorize('pharmacist', 'superadmin'),
  upload.single('labelImage'),
  scanLabel
);

// Bulk import - restricted to pharmacist or superadmin
router.post('/bulk', authorize('pharmacist', 'superadmin'), bulkImportMedicines);

// standard CRUD
router
  .route('/')
  .get(getAllMedicines)
  .post(authorize('pharmacist', 'superadmin'), createMedicine);

router
  .route('/:id')
  .put(authorize('pharmacist', 'superadmin'), updateMedicine)
  .delete(authorize('pharmacist', 'superadmin'), deleteMedicine);

export default router;
