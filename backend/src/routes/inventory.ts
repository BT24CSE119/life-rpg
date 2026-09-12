import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserInventoryHandler,
  equipItemHandler,
  unequipItemHandler,
} from '../controllers/inventory.controller';

const router = Router();

router.use(authenticate);

router.get('/', getUserInventoryHandler);
router.post('/:itemId/equip', equipItemHandler);
router.post('/:itemId/unequip', unequipItemHandler);

export default router;
