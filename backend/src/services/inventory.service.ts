import prisma from '../config/database';
import { LogAction, Prisma } from '@prisma/client';
import { realtimeService } from './realtime.service';

export const getUserInventory = async (userId: string) => {
  const items = await prisma.inventory.findMany({
    where: { userId },
    include: {
      item: true,
    },
    orderBy: [{ isEquipped: 'desc' }, { acquiredAt: 'desc' }],
  });

  return items;
};

export const equipItem = async (userId: string, itemId: string) => {
  const outcome = await prisma.$transaction(
    async (tx) => {
      const inventoryEntry = await tx.inventory.findUnique({
        where: {
          userId_itemId: {
            userId,
            itemId,
          },
        },
        include: { item: true },
      });

      if (!inventoryEntry) {
        const error = new Error('You do not own this item in your inventory') as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
      }

      const itemCategory = inventoryEntry.item.category || inventoryEntry.item.type;

      // Unequip any existing equipped items in the same slot/category
      const currentlyEquipped = await tx.inventory.findMany({
        where: {
          userId,
          isEquipped: true,
        },
        include: { item: true },
      });

      for (const eq of currentlyEquipped) {
        const eqCategory = eq.item.category || eq.item.type;
        if (eqCategory === itemCategory && eq.itemId !== itemId) {
          await tx.inventory.update({
            where: { id: eq.id },
            data: { isEquipped: false },
          });
        }
      }

      const updated = await tx.inventory.update({
        where: { id: inventoryEntry.id },
        data: { isEquipped: true },
        include: { item: true },
      });

      // If equipping an AVATAR skin/portrait, update the user profile's avatarUrl
      if (itemCategory === 'AVATAR' && inventoryEntry.item.imageUrl) {
        await tx.user.update({
          where: { id: userId },
          data: { avatarUrl: inventoryEntry.item.imageUrl },
        });
      }

      await tx.activityLog.create({
        data: {
          userId,
          action: LogAction.ITEM_EQUIPPED,
          metadata: { itemId, name: inventoryEntry.item.name, category: itemCategory },
        },
      });

      const result = updated;
      return result;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );

  realtimeService.emitUserEvent(userId, 'ITEM_EQUIPPED', {
    itemId,
    item: outcome.item,
  });

  return outcome;
};

export const unequipItem = async (userId: string, itemId: string) => {
  const inventoryEntry = await prisma.inventory.findUnique({
    where: {
      userId_itemId: {
        userId,
        itemId,
      },
    },
    include: { item: true },
  });

  if (!inventoryEntry) {
    const error = new Error('You do not own this item in your inventory') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  const itemCategory = inventoryEntry.item.category || inventoryEntry.item.type;

  const updated = await prisma.$transaction(async (tx) => {
    const unequipped = await tx.inventory.update({
      where: { id: inventoryEntry.id },
      data: { isEquipped: false },
      include: { item: true },
    });

    if (itemCategory === 'AVATAR') {
      await tx.user.update({
        where: { id: userId },
        data: { avatarUrl: null },
      });
    }

    await tx.activityLog.create({
      data: {
        userId,
        action: LogAction.ITEM_UNEQUIPPED,
        metadata: { itemId, name: inventoryEntry.item.name },
      },
    });

    return unequipped;
  });

  realtimeService.emitUserEvent(userId, 'ITEM_UNEQUIPPED', {
    itemId,
    item: updated.item,
  });

  return updated;
};
