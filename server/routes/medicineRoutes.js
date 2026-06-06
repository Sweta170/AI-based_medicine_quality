import express from 'express';
import {
  getAllMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from '../controllers/medicineController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAllMedicines)
  .post(authorize('pharmacist', 'superadmin'), createMedicine);

router
  .route('/:id')
  .put(authorize('pharmacist', 'superadmin'), updateMedicine)
  .delete(authorize('pharmacist', 'superadmin'), deleteMedicine);

export default router;
