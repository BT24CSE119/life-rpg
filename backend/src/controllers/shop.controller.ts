import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/auth';
import { getShopItems, purchaseItem } from '../services/shop.service';

const getUserId = (req: Request): string => (req as AuthenticatedRequest).user.id;

export const getShopItemsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const shop = await getShopItems(userId);
    res.status(200).json({
      success: true,
      message: 'Guild shop catalogue retrieved',
      data: shop,
    });
  } catch (err) {
    next(err);
  }
};

export const purchaseItemHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await purchaseItem(userId, id);
    res.status(201).json({
      success: true,
      message: `Successfully purchased ${result.item.name}!`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
