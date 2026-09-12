import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/auth';
import { getUserInventory, equipItem, unequipItem } from '../services/inventory.service';

const getUserId = (req: Request): string => (req as AuthenticatedRequest).user.id;

export const getUserInventoryHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const inventory = await getUserInventory(userId);
    res.status(200).json({
      success: true,
      message: 'Inventory retrieved',
      data: inventory,
    });
  } catch (err) {
    next(err);
  }
};

export const equipItemHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const itemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
    const result = await equipItem(userId, itemId);
    res.status(200).json({
      success: true,
      message: `Equipped ${result.item.name}`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const unequipItemHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const itemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
    const result = await unequipItem(userId, itemId);
    res.status(200).json({
      success: true,
      message: `Unequipped ${result.item.name}`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
