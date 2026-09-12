import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getShopItemsHandler, purchaseItemHandler } from '../controllers/shop.controller';

const router = Router();

router.use(authenticate);

router.get('/items', getShopItemsHandler);
router.post('/items/:id/purchase', purchaseItemHandler);

export default router;
