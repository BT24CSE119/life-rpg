import React, { useEffect, useState, useCallback } from 'react';
import { getGoldHistory } from '../services/rpg';
import type { GoldHistoryItem } from '../types';

interface GoldHistoryListProps {
  initialLimit?: number;
  refreshTrigger?: number;
}

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: string; bg: string; text: string; border: string }
> = {
  QUEST_REWARD: {
    label: 'Quest Reward',
    icon: '⚔️',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  BONUS: {
    label: 'Bonus',
    icon: '✨',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  PENALTY: {
    label: 'Penalty',
    icon: '⚠️',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
  ADMIN_ADJUSTMENT: {
    label: 'Adjustment',
    icon: '⚖️',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  PURCHASE: {
    label: 'Purchase',
    icon: '🛒',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  REFUND: {
    label: 'Refund',
    icon: '↩️',
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    border: 'border-teal-500/30',
  },
};

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const GoldHistoryList: React.FC<GoldHistoryListProps> = ({
  initialLimit = 10,
  refreshTrigger = 0,
}) => {
  const [items, setItems] = useState<GoldHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGoldHistory(p, initialLimit);
      setItems(data.items);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err) {
      setError((err as Error).message || 'Unable to fetch Gold history');
    } finally {
      setLoading(false);
    }
  }, [initialLimit]);

  useEffect(() => {
    fetchHistory(page);
  }, [fetchHistory, page, refreshTrigger]);

  return (
    <section
      className="bg-rpg-surface border border-rpg-border rounded-rpg-lg p-6"
      aria-label="Gold Transaction History"
    >
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h2 className="font-display text-xl font-bold text-rpg-text">
            Gold Transaction Ledger
          </h2>
          <p className="text-xs text-rpg-text-muted mt-0.5">
            Immutable server records of every coin earned and spent ({total} total transactions)
          </p>
        </div>
        <button
          onClick={() => fetchHistory(page)}
          disabled={loading}
          className="text-xs text-rpg-text-muted hover:text-rpg-gold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          title="Refresh ledger"
        >
          <span className={loading ? 'animate-spin' : ''} aria-hidden="true">
            🔄
          </span>
          Refresh
        </button>
      </div>

      {loading && items.length === 0 ? (
        <div className="space-y-3 animate-pulse py-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-rpg-surface-2 rounded-rpg border border-rpg-border" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 bg-rpg-surface-2 rounded-rpg border border-rpg-border p-4 my-2">
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <button
            onClick={() => fetchHistory(page)}
            className="px-4 py-1.5 rounded-rpg text-xs font-semibold bg-rpg-gold text-rpg-bg hover:brightness-110"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-rpg-text-muted">
          <span className="text-4xl block mb-2" aria-hidden="true">
            🪙
          </span>
          <p className="font-medium text-rpg-text">No Gold transactions recorded yet</p>
          <p className="text-xs text-rpg-text-muted mt-1">
            Complete quests on the Quest Board to earn your first gold rewards!
          </p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-rpg-border">
            {items.map((item) => {
              const isPositive = item.amount >= 0;
              const cfg = TYPE_CONFIG[item.type] || {
                label: item.type,
                icon: '🪙',
                bg: 'bg-slate-500/10',
                text: 'text-slate-300',
                border: 'border-slate-500/30',
              };

              return (
                <li
                  key={item.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-rpg-surface-2/40 px-2 rounded-rpg transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-rpg flex items-center justify-center text-base shrink-0 border ${cfg.bg} ${cfg.border}`}
                      aria-hidden="true"
                    >
                      {cfg.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-rpg-text truncate">
                          {item.questTitle || item.reason.replace(/_/g, ' ')}
                        </p>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-rpg-text-muted mt-1 flex-wrap">
                        <span>Balance After: <strong className="text-rpg-gold font-mono">{item.balanceAfter}g</strong></span>
                        <span>·</span>
                        <span>{formatDateTime(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-display font-bold text-base font-mono ${
                        isPositive ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isPositive ? `+${item.amount}` : item.amount} Gold
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-rpg-border text-xs text-rpg-text-muted">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="px-3 py-1.5 rounded-rpg-sm bg-rpg-surface-2 border border-rpg-border text-rpg-text hover:bg-rpg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  className="px-3 py-1.5 rounded-rpg-sm bg-rpg-surface-2 border border-rpg-border text-rpg-text hover:bg-rpg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default GoldHistoryList;
