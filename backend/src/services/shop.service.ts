import prisma from '../config/database';
import {
  Prisma,
  ItemType,
  ItemRarity,
  GoldTransactionType,
  GoldReason,
  NotificationType,
  LogAction,
} from '@prisma/client';
import { getOrCreateProfile } from './rpg.service';
import { createNotification } from './notification.service';
import { realtimeService } from './realtime.service';

export const INITIAL_SHOP_ITEMS = [
  {
    name: 'Crown of Focus',
    description: 'A radiant golden crown that gleams upon the brow of disciplined adventurers.',
    type: ItemType.COSMETIC,
    rarity: ItemRarity.RARE,
    category: 'AVATAR_FRAME',
    goldCost: 75,
    iconEmoji: '👑',
  },
  {
    name: 'Novice Pathfinder Title',
    description: 'Bestows the distinguished title "Pathfinder" upon your adventurer banner.',
    type: ItemType.COSMETIC,
    rarity: ItemRarity.COMMON,
    category: 'TITLE',
    goldCost: 30,
    iconEmoji: '📜',
  },
  {
    name: 'Archmage of Time Title',
    description: 'Bestows the prestigious title "Archmage of Time" upon your hero sheet.',
    type: ItemType.COSMETIC,
    rarity: ItemRarity.EPIC,
    category: 'TITLE',
    goldCost: 150,
    iconEmoji: '⏳',
  },
  {
    name: 'Arcane Aura Theme',
    description: 'Surrounds your dashboard hero card with a violet magical shimmer.',
    type: ItemType.COSMETIC,
    rarity: ItemRarity.UNCOMMON,
    category: 'EFFECT',
    goldCost: 60,
    iconEmoji: '🔮',
  },
  {
    name: 'Guild Champion Badge',
    description: 'An engraved golden medal recognizing true dedication to daily quests.',
    type: ItemType.COSMETIC,
    rarity: ItemRarity.RARE,
    category: 'BADGE',
    goldCost: 90,
    iconEmoji: '🎖️',
  },
  {
    name: 'Elixir of Clarity',
    description: 'A glowing azure draught that invigorates the mind and spirit.',
    type: ItemType.CONSUMABLE,
    rarity: ItemRarity.COMMON,
    category: 'BOOSTER',
    goldCost: 20,
    iconEmoji: '🧪',
  },
];

export const ensureShopItemsSeeded = async () => {
  for (const item of INITIAL_SHOP_ITEMS) {
    await prisma.item.upsert({
      where: { name: item.name },
      create: {
        ...item,
        isActive: true,
      },
      update: {
        description: item.description,
        type: item.type,
        rarity: item.rarity,
        category: item.category,
        goldCost: item.goldCost,
        iconEmoji: item.iconEmoji,
        isActive: true,
      },
    });
  }
};

export const getShopItems = async (userId: string) => {
  await ensureShopItemsSeeded();

  const [items, userInventory, profile] = await Promise.all([
    prisma.item.findMany({
      where: { isActive: true },
      orderBy: [{ goldCost: 'asc' }, { name: 'asc' }],
    }),
    prisma.inventory.findMany({
      where: { userId },
    }),
    getOrCreateProfile(userId),
  ]);

  const inventoryMap = new Map(userInventory.map((inv) => [inv.itemId, inv]));

  const catalog = items.map((item) => {
    const inv = inventoryMap.get(item.id);
    return {
      ...item,
      ownedQuantity: inv?.quantity ?? 0,
      isEquipped: inv?.isEquipped ?? false,
      canAfford: profile.goldBalance >= item.goldCost,
    };
  });

  return {
    items: catalog,
    userGoldBalance: profile.goldBalance,
  };
};

export const purchaseItem = async (userId: string, itemId: string) => {
  await ensureShopItemsSeeded();

  const result = await prisma.$transaction(
    async (tx) => {
      const item = await tx.item.findFirst({
        where: { id: itemId, isActive: true },
      });

      if (!item) {
        const error = new Error('Shop item not found or unavailable') as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
      }

      const profile = await tx.playerProfile.upsert({
        where: { userId },
        create: {
          userId,
          totalXp: 0,
          level: 1,
          goldBalance: 0,
          strength: 1,
          intelligence: 1,
          discipline: 1,
          stamina: 1,
          consistency: 1,
          currentStreak: 0,
          longestStreak: 0,
          lastProductiveDate: null,
        },
        update: {},
      });

      if (profile.goldBalance < item.goldCost) {
        const error = new Error(
          `Insufficient Gold. You have ${profile.goldBalance}g, but this item costs ${item.goldCost}g.`
        ) as Error & { statusCode: number };
        error.statusCode = 400;
        throw error;
      }

      const newGoldBalance = profile.goldBalance - item.goldCost;

      // Deduct gold
      await tx.playerProfile.update({
        where: { userId },
        data: { goldBalance: newGoldBalance },
      });

      // Record transaction
      await tx.goldTransaction.create({
        data: {
          userId,
          amount: -item.goldCost,
          balanceAfter: newGoldBalance,
          type: GoldTransactionType.PURCHASE,
          reason: GoldReason.SHOP_PURCHASE,
        },
      });

      // Add to inventory
      const inventory = await tx.inventory.upsert({
        where: {
          userId_itemId: {
            userId,
            itemId: item.id,
          },
        },
        create: {
          userId,
          itemId: item.id,
          quantity: 1,
          isEquipped: false,
        },
        update: {
          quantity: { increment: 1 },
        },
        include: { item: true },
      });

      // Create notification
      await createNotification(
        userId,
        NotificationType.SHOP_PURCHASE,
        `🪙 Purchased: ${item.name}!`,
        `You acquired ${item.name} from the Guild Shop for ${item.goldCost} Gold.`,
        { itemId: item.id, cost: item.goldCost },
        tx
      );

      // Create activity log
      await tx.activityLog.create({
        data: {
          userId,
          action: LogAction.ITEM_PURCHASED,
          metadata: { itemId: item.id, name: item.name, cost: item.goldCost },
        },
      });

      return {
        item,
        newGoldBalance,
        inventory,
      };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );

  realtimeService.emitUserEvent(userId, 'ITEM_PURCHASED', {
    itemId,
    item: result.item,
    newGoldBalance: result.newGoldBalance,
  });
  realtimeService.emitUserEvent(userId, 'GOLD_GAINED', {
    amount: -result.item.goldCost,
    goldBalance: result.newGoldBalance,
  });

  return result;
};
