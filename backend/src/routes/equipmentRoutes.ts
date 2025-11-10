import { Router } from 'express';
import {
  getEquipments,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  updateEquipmentStatus,
  deleteEquipment,
} from '../controllers/equipmentController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getEquipments);
router.get('/:id', getEquipmentById);
router.post('/', isAdmin, createEquipment);
router.put('/:id', isAdmin, updateEquipment);
router.patch('/:id/status', updateEquipmentStatus);
router.delete('/:id', isAdmin, deleteEquipment);

export default router;
