import React, { useState, useEffect } from 'react';
import PageContainer from '../layouts/PageContainer';
import { getShopItems, purchaseShopItem } from '../services/shop';
import { useRpg } from '../context/RpgContext';
import type { ShopItem } from '../types';

const RARITY_STYLES: Record<string, { badge: string; border: string }> = {
  COMMON:    { badge: 'bg-slate-800 text-slate-300 border-slate-700', border: 'border-rpg-border hover:border-slate-500' },
  UNCOMMON:  { badge: 'bg-emerald-950 text-emerald-300 border-emerald-500/30', border: 'border-emerald-500/30 hover:border-emerald-400' },
  RARE:      { badge: 'bg-blue-950 text-blue-300 border-blue-500/30', border: 'border-blue-500/30 hover:border-blue-400' },
  EPIC:      { badge: 'bg-purple-950 text-purple-300 border-purple-500/40', border: 'border-purple-500/40 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]' },
  LEGENDARY: { badge: 'bg-amber-950 text-amber-300 border-amber-500/50', border: 'border-amber-500/50 hover:border-amber-400 shadow-[0_0_20px_rgba(245,200,66,0.2)]' },
};

const ShopPage: React.FC = () => {
  const { setGoldBalance: setGlobalGold } = useRpg();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [goldBalance, setGoldBalance] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadCatalog = async () => {
    setIsLoading(true);
    try {
      const data = await getShopItems();
      setItems(data.items);
      setGoldBalance(data.userGoldBalance);
      setGlobalGold(data.userGoldBalance);
    } catch {
      // Silently handle
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const handlePurchase = async () => {
    if (!confirmItem || purchasingId) return;
    setPurchasingId(confirmItem.id);
    try {
      const result = await purchaseShopItem(confirmItem.id);
      setGoldBalance(result.newGoldBalance);
      setGlobalGold(result.newGoldBalance);
      setToast(`🎉 Successfully acquired ${confirmItem.name}!`);
      setConfirmItem(null);
      await loadCatalog();
    } catch (err: unknown) {
      setToast((err as Error).message || 'Purchase failed');
    } finally {
      setPurchasingId(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const categories = ['ALL', 'AVATAR_FRAME', 'TITLE', 'EFFECT', 'BADGE', 'BOOSTER'];
  const filteredItems = items
    .filter((i) => selectedCategory === 'ALL' || (i.category || i.type) === selectedCategory)
    .filter((i) => !searchQuery.trim() || i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.description.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <PageContainer>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-rpg-border/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl" aria-hidden="true">🪙</span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                Guild Treasury & Bazaar
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-rpg-text">
              Guild Shop
            </h1>
            <p className="text-xs sm:text-sm text-rpg-text-muted mt-1 max-w-xl">
              Spend hard-earned quest Gold on titles, avatar frames, magical themes, and booster elixirs.
            </p>
          </div>

          {/* Treasury Balance Pill */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/50 to-rpg-surface border border-amber-500/40 shadow-sm flex items-center gap-3 shrink-0">
            <span className="text-3xl animate-coin-sparkle" aria-hidden="true">🪙</span>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold">
                Your Treasury
              </p>
              <p className="font-display text-2xl font-black text-amber-200">
                {goldBalance} <span className="text-xs font-mono font-semibold">Gold</span>
              </p>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-rpg-surface-2/60 text-rpg-text-muted border border-transparent hover:border-rpg-border'
                }`}
              >
                {cat === 'ALL' ? 'All Wares' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative shrink-0 w-full sm:w-64">
            <input
              type="text"
              placeholder="🔍 Search treasures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-rpg-surface-2 border border-rpg-border text-rpg-text focus:outline-none focus:border-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-rpg-text-muted hover:text-rpg-text"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Shop Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-rpg-surface border border-rpg-border" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-rpg-surface border border-rpg-border rounded-xl">
            <span className="text-4xl block mb-2" aria-hidden="true">🧙‍♂️</span>
            <p className="text-rpg-text font-bold">No wares found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const rarityStyle = RARITY_STYLES[item.rarity] || RARITY_STYLES.COMMON;
              const canAfford = goldBalance >= item.goldCost;

              return (
                <div
                  key={item.id}
                  className={`relative p-5 rounded-xl bg-rpg-surface/90 backdrop-blur-sm border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${rarityStyle.border}`}
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-3xl" aria-hidden="true">
                        {item.iconEmoji || '📦'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${rarityStyle.badge}`}>
                          {item.rarity}
                        </span>
                        {item.ownedQuantity > 0 && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                            Owned ({item.ownedQuantity})
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-display text-lg font-bold text-rpg-text mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-rpg-text-muted leading-relaxed mb-4">
                      {item.description}
                    </p>
                  </div>

                  {/* Purchase CTA */}
                  <div className="pt-3 border-t border-rpg-border/40 flex items-center justify-between gap-3">
                    <span className="text-sm font-mono font-black text-amber-300 flex items-center gap-1">
                      <span aria-hidden="true">🪙</span> {item.goldCost} Gold
                    </span>

                    <button
                      onClick={() => setConfirmItem(item)}
                      disabled={!canAfford}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                        canAfford
                          ? 'bg-rpg-gradient-gold text-rpg-bg hover:brightness-110 shadow-rpg-gold'
                          : 'bg-rpg-surface-2 text-rpg-text-muted border border-rpg-border cursor-not-allowed opacity-60'
                      }`}
                    >
                      {canAfford ? 'Purchase' : 'Need More Gold'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Purchase Confirmation Modal */}
        {confirmItem && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-purchase-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          >
            <div className="w-full max-w-md p-6 bg-rpg-surface border border-amber-500/40 rounded-xl shadow-2xl text-center">
              <span className="text-5xl block mb-3" aria-hidden="true">
                {confirmItem.iconEmoji || '🪙'}
              </span>
              <h2 id="confirm-purchase-title" className="font-display text-xl font-bold text-rpg-text mb-1">
                Confirm Acquisition
              </h2>
              <p className="text-sm text-rpg-text-muted mb-4">
                Acquire <strong className="text-amber-300">{confirmItem.name}</strong> for <strong className="text-amber-300">{confirmItem.goldCost} Gold</strong>?
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setConfirmItem(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-rpg-surface-2 border border-rpg-border text-rpg-text hover:bg-rpg-surface-3 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={purchasingId === confirmItem.id}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-rpg-gradient-gold text-rpg-bg hover:brightness-110 shadow-rpg-gold active:scale-95 transition-all"
                >
                  {purchasingId === confirmItem.id ? 'Acquiring…' : 'Confirm Purchase'}
                </button>
              </div>
            </div>
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

export default ShopPage;
