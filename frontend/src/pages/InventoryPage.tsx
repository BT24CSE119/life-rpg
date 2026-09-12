import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../layouts/PageContainer';
import { getUserInventory, equipItem, unequipItem } from '../services/inventory';
import type { InventoryItem } from '../types';

const RARITY_STYLES: Record<string, { badge: string; border: string }> = {
  COMMON:    { badge: 'bg-slate-800 text-slate-300 border-slate-700', border: 'border-rpg-border hover:border-slate-500' },
  UNCOMMON:  { badge: 'bg-emerald-950 text-emerald-300 border-emerald-500/30', border: 'border-emerald-500/30 hover:border-emerald-400' },
  RARE:      { badge: 'bg-blue-950 text-blue-300 border-blue-500/30', border: 'border-blue-500/30 hover:border-blue-400' },
  EPIC:      { badge: 'bg-purple-950 text-purple-300 border-purple-500/40', border: 'border-purple-500/40 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]' },
  LEGENDARY: { badge: 'bg-amber-950 text-amber-300 border-amber-500/50', border: 'border-amber-500/50 hover:border-amber-400 shadow-[0_0_20px_rgba(245,200,66,0.2)]' },
};

const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const data = await getUserInventory();
      setItems(data);
    } catch {
      // Silently handle
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleEquip = async (itemId: string, name: string) => {
    setActionId(itemId);
    try {
      await equipItem(itemId);
      setToast(`⚔️ Equipped ${name}`);
      await loadInventory();
    } catch (err: unknown) {
      setToast((err as Error).message || 'Failed to equip item');
    } finally {
      setActionId(null);
      setTimeout(() => setToast(null), 3500);
    }
  };

  const handleUnequip = async (itemId: string, name: string) => {
    setActionId(itemId);
    try {
      await unequipItem(itemId);
      setToast(`Unequipped ${name}`);
      await loadInventory();
    } catch (err: unknown) {
      setToast((err as Error).message || 'Failed to unequip item');
    } finally {
      setActionId(null);
      setTimeout(() => setToast(null), 3500);
    }
  };

  const equippedCount = items.filter((i) => i.isEquipped).length;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <PageContainer>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-rpg-border/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl" aria-hidden="true">🎒</span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                Adventurer Satchel
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-rpg-text">
              My Inventory
            </h1>
            <p className="text-xs sm:text-sm text-rpg-text-muted mt-1 max-w-xl">
              Equip titles, cosmetic frames, and badges to customize your adventurer identity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-rpg-surface-2 border border-rpg-border text-xs font-mono font-semibold text-rpg-text">
              Equipped: <strong className="text-amber-300">{equippedCount}</strong> Items
            </span>
            <Link
              to="/shop"
              className="px-4 py-2 rounded-lg text-xs font-bold bg-rpg-gradient-gold text-rpg-bg hover:brightness-110 shadow-rpg-gold transition-all"
            >
              🏪 Visit Shop
            </Link>
          </div>
        </div>

        {/* Inventory Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-rpg-surface border border-rpg-border" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-rpg-surface border border-rpg-border rounded-xl">
            <span className="text-5xl block mb-3" aria-hidden="true">🎒</span>
            <h2 className="font-display text-xl font-bold text-rpg-text mb-1">
              Your satchel is empty
            </h2>
            <p className="text-xs text-rpg-text-muted mb-6 max-w-sm mx-auto">
              You haven't acquired any wares yet. Visit the Guild Shop to spend your Gold.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-rpg-gradient-gold text-rpg-bg hover:brightness-110 shadow-rpg-gold transition-all"
            >
              🪙 Browse Guild Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((inv) => {
              const item = inv.item;
              const rarityStyle = RARITY_STYLES[item.rarity] || RARITY_STYLES.COMMON;
              const isActioning = actionId === inv.itemId;

              return (
                <div
                  key={inv.id}
                  className={`relative p-5 rounded-xl bg-rpg-surface/90 backdrop-blur-sm border flex flex-col justify-between transition-all duration-300 ${
                    inv.isEquipped ? 'border-amber-400/80 shadow-[0_0_15px_rgba(245,200,66,0.15)] ring-1 ring-amber-400/50' : rarityStyle.border
                  }`}
                >
                  {inv.isEquipped && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-400 text-rpg-bg shadow-sm">
                      Equipped
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl" aria-hidden="true">
                        {item.iconEmoji || '📦'}
                      </span>
                      <div>
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${rarityStyle.badge}`}>
                          {item.rarity}
                        </span>
                        <h3 className="font-display text-base font-bold text-rpg-text mt-1">
                          {item.name}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-rpg-text-muted leading-relaxed mb-4">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-rpg-border/40 flex items-center justify-between gap-3">
                    <span className="text-xs font-mono text-rpg-text-faint">
                      Qty: {inv.quantity} · {item.category || item.type}
                    </span>

                    {inv.isEquipped ? (
                      <button
                        onClick={() => handleUnequip(inv.itemId, item.name)}
                        disabled={isActioning}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rpg-surface-2 border border-rpg-border text-rpg-text-muted hover:text-red-400 hover:border-red-400/40 transition-colors"
                      >
                        {isActioning ? 'Unequipping…' : 'Unequip'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEquip(inv.itemId, item.name)}
                        disabled={isActioning}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rpg-gradient-gold text-rpg-bg hover:brightness-110 shadow-rpg-gold transition-all active:scale-95"
                      >
                        {isActioning ? 'Equipping…' : 'Equip'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl border bg-emerald-950/90 text-emerald-300 border-emerald-500/40 text-sm font-semibold animate-fade-in">
            {toast}
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default InventoryPage;
