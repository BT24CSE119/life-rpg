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
  // ── Character Avatars & Skins ──
  {
    name: 'Cyber Knight Avatar',
    description: 'A neon-clad cyber warrior forged in the future realms of high productivity.',
    type: ItemType.COSMETIC,
    rarity: ItemRarity.EPIC,
    category: 'AVATAR',
    goldCost: 120,
    iconEmoji: '🤖',
    imageUrl: '/avatars/cyber-knight.jpg',
  },
  {
    name: 'Shadow Assassin Skin',
    description: 'Cloaked in midnight mist, striking down distractions with lethal stealth.',
    type: ItemType.COSMETIC,
    rarity: ItemRarity.RARE,
    category: 'AVATAR',
    goldCost: 20,
    iconEmoji: '🥷',
    imageUrl: '/avatars/shadow-assassin.jpg',
  },
  {
    name: 'Archmage Sorcerer Avatar',
    description: 'Master of deep arcane focus and ancient intellect spells.',
    type: ItemType.COSMETIC,
    rarity: ItemRarity.EPIC,
    category: 'AVATAR',
    goldCost: 140,
    iconEmoji: '🧙',
    imageUrl: '/avatars/archmage-sorcerer.jpg',
  },
  {
    name: 'Holy Paladin Skin',
    description: 'A radiant guardian of habits clad in shining divine golden armor.',
    type: ItemType.COSMETIC,
    rarity: ItemRarity.LEGENDARY,
    category: 'AVATAR',
    goldCost: 200,
    iconEmoji: '🛡️',
    imageUrl: '/avatars/holy-paladin.jpg',
  },

  // ── Weapons & Armory ──
  {
    name: 'Excalibur of Focus',
    description: 'A legendary blade forged from pure willpower. Cleaves through procrastination (+2 STR).',
    type: ItemType.WEAPON,
    rarity: ItemRarity.LEGENDARY,
    category: 'WEAPON',
    goldCost: 180,
    iconEmoji: '⚔️',
  },
  {
    name: 'Tome of Arcane Wisdom',
    description: 'Contains forgotten formulas for boundless intellect and study mastery (+2 INT).',
    type: ItemType.WEAPON,
    rarity: ItemRarity.RARE,
    category: 'WEAPON',
    goldCost: 85,
    iconEmoji: '📖',
  },
  {
    name: 'Aegis of Willpower',
    description: 'An impenetrable round shield that blocks mental fatigue and impulses (+2 DIS).',
    type: ItemType.ARMOR,
    rarity: ItemRarity.RARE,
    category: 'ARMOR',
    goldCost: 90,
    iconEmoji: '🛡️',
  },
  {
    name: 'Boots of Swift Momentum',
    description: 'Enchanted winged greaves granting tireless daily stamina (+2 STA).',
    type: ItemType.ARMOR,
    rarity: ItemRarity.UNCOMMON,
    category: 'ARMOR',
    goldCost: 50,
    iconEmoji: '👢',
  },

  // ── Cosmetics, Titles & Badges ──
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
        imageUrl: item.imageUrl || null,
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
