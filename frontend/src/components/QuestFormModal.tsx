import React, { useState, useEffect, useId } from 'react';
import type { Quest, QuestPriority, CreateQuestInput, UpdateQuestInput } from '../types';

// ── Props ─────────────────────────────────────────────────────────────────────

interface QuestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateQuestInput | UpdateQuestInput) => Promise<void>;
  quest?: Quest | null;  // If provided, we're editing
  isLoading?: boolean;
}

const CATEGORY_OPTIONS: { value: string; label: string; stat: string; desc: string; icon: string }[] = [
  { value: 'STRENGTH',     label: 'Strength',     stat: '+STR', desc: 'Fitness, gym, manual labor',          icon: '⚔️' },
  { value: 'INTELLIGENCE', label: 'Intelligence', stat: '+INT', desc: 'Coding, study, reading, research',     icon: '🧠' },
  { value: 'DISCIPLINE',   label: 'Discipline',   stat: '+DIS', desc: 'Deep focus, meditation, early rise',   icon: '🛡️' },
  { value: 'STAMINA',      label: 'Stamina',      stat: '+STA', desc: 'Cardio, endurance, health habits',    icon: '⚡' },
  { value: 'CONSISTENCY',  label: 'Consistency',  stat: '+CON', desc: 'Daily routines, journaling, chores',  icon: '🎯' },
];

const PRIORITY_OPTIONS: { value: QuestPriority; label: string; icon: string }[] = [
  { value: 'LOW',    label: 'Low',    icon: '🟢' },
  { value: 'MEDIUM', label: 'Medium', icon: '🟡' },
  { value: 'HIGH',   label: 'High',   icon: '🔴' },
];

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do', icon: '📝' },
  { value: 'IN_PROGRESS', label: 'In Progress', icon: '⚔️' },
  { value: 'ACTIVE',    label: 'Active',    icon: '⚔️' },
  { value: 'FAILED',    label: 'Failed',    icon: '❌' },
  { value: 'ABANDONED', label: 'Abandoned', icon: '🏳️' },
] as const;

const QuestFormModal: React.FC<QuestFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  quest,
  isLoading = false,
}) => {
  const baseId = useId();
  const isEdit = !!quest;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('STRENGTH');
  const [priority, setPriority] = useState<QuestPriority>('MEDIUM');
  const [status, setStatus] = useState('TODO');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<{ title?: string; general?: string }>({});

  // Pre-fill when editing
  useEffect(() => {
    if (quest) {
      setTitle(quest.title);
      setDescription(quest.description ?? '');
      setCategory(quest.category?.toUpperCase() ?? 'STRENGTH');
      setPriority(quest.priority);
      setStatus(quest.status);
      setDueDate(quest.dueDate ? quest.dueDate.slice(0, 16) : '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('STRENGTH');
      setPriority('MEDIUM');
      setStatus('TODO');
      setDueDate('');
    }
    setErrors({});
  }, [quest, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrors({ title: 'Quest title is required' });
      return;
    }
    if (trimmedTitle.length > 100) {
      setErrors({ title: 'Title must be at most 100 characters' });
      return;
    }

    try {
      if (isEdit) {
        const updateData: UpdateQuestInput = {
          title: trimmedTitle,
          description: description.trim() || null,
          category,
          priority,
          status: status as UpdateQuestInput['status'],
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        };
        await onSubmit(updateData);
      } else {
        const createData: CreateQuestInput = {
          title: trimmedTitle,
          description: description.trim() || undefined,
          category,
          priority,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        };
        await onSubmit(createData);
      }
    } catch (err) {
      const error = err as Error;
      setErrors({ general: error.message ?? 'Something went wrong' });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${baseId}-title`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-rpg-surface border border-rpg-border rounded-rpg-lg shadow-2xl shadow-black/50 animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-rpg-border">
          <h2 id={`${baseId}-title`} className="font-display text-xl font-bold text-rpg-text flex items-center gap-2">
            {isEdit ? (
              <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
                <line x1="13" y1="19" x2="19" y2="13" />
                <line x1="16" y1="16" x2="20" y2="20" />
                <line x1="19" y1="21" x2="21" y2="19" />
              </svg>
            )}
            <span>{isEdit ? 'Edit Quest' : 'New Quest'}</span>
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg bg-rpg-surface-2 border border-white/5 text-rpg-text-muted hover:text-rpg-text flex items-center justify-center text-sm transition-all"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {errors.general && (
            <div role="alert" className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <span aria-hidden="true">⚠️</span>
              <span>{errors.general}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor={`${baseId}-title-input`} className="block text-sm font-medium text-rpg-text-muted mb-1.5">
              Quest Title <span className="text-red-400">*</span>
            </label>
            <input
              id={`${baseId}-title-input`}
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors({}); }}
              disabled={isLoading}
              placeholder="Complete DBMS revision"
              maxLength={100}
              className={`w-full px-4 py-2.5 rounded-rpg bg-rpg-bg border text-rpg-text placeholder:text-rpg-text-muted/40 text-sm outline-none transition-all focus:ring-2 focus:ring-rpg-gold/40 disabled:opacity-50 ${
                errors.title ? 'border-red-500/60' : 'border-rpg-border focus:border-rpg-gold/60'
              }`}
            />
            {errors.title && (
              <p role="alert" className="mt-1 text-xs text-red-400">{errors.title}</p>
            )}
            <p className="mt-1 text-xs text-rpg-text-faint text-right">{title.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor={`${baseId}-desc`} className="block text-sm font-medium text-rpg-text-muted mb-1.5">
              Description
            </label>
            <textarea
              id={`${baseId}-desc`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              placeholder="Describe your quest objectives…"
              maxLength={1000}
              rows={3}
              className="w-full px-4 py-2.5 rounded-rpg bg-rpg-bg border border-rpg-border text-rpg-text placeholder:text-rpg-text-muted/40 text-sm outline-none transition-all focus:ring-2 focus:ring-rpg-gold/40 focus:border-rpg-gold/60 disabled:opacity-50 resize-none"
            />
            <p className="mt-1 text-xs text-rpg-text-faint text-right">{description.length}/1000</p>
          </div>

          {/* Character Attribute Focus (Category) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-rpg-text-muted flex items-center gap-1.5">
                <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="m10 13-2 2 2 2" />
                  <path d="m14 17 2-2-2-2" />
                </svg>
                Character Attribute Focus
              </label>
              <span className="text-xs text-amber-400/90 font-mono font-semibold">
                Awards +1 to stat on completion
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  disabled={isLoading}
                  className={`p-2 rounded-rpg text-center border transition-all disabled:opacity-50 flex flex-col items-center gap-1 ${
                    category === cat.value
                      ? 'bg-amber-950/40 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,200,66,0.15)] ring-1 ring-amber-500/40'
                      : 'bg-rpg-bg text-rpg-text-muted border-rpg-border hover:border-rpg-border-2'
                  }`}
                >
                  <span className="text-base" aria-hidden="true">{cat.icon}</span>
                  <span className="text-[11px] font-bold text-rpg-text leading-tight">{cat.label}</span>
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                    {cat.stat}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-rpg-text-muted mb-1.5">
              Priority & Bounty
            </label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  disabled={isLoading}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-rpg text-sm font-medium border transition-all disabled:opacity-50 ${
                    priority === opt.value
                      ? 'bg-rpg-gold/15 text-rpg-gold border-rpg-gold/40'
                      : 'bg-rpg-bg text-rpg-text-muted border-rpg-border hover:border-rpg-border-2'
                  }`}
                >
                  <span aria-hidden="true">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Completion uses the dedicated Complete action so XP is awarded atomically. */}
          {isEdit && quest.status !== 'COMPLETED' && (
            <div>
              <label htmlFor={`${baseId}-status`} className="block text-sm font-medium text-rpg-text-muted mb-1.5">
                Status
              </label>
              <select
                id={`${baseId}-status`}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-rpg bg-rpg-bg border border-rpg-border text-rpg-text text-sm outline-none transition-all focus:ring-2 focus:ring-rpg-gold/40 focus:border-rpg-gold/60 disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Due Date & Time */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-rpg-text-muted flex items-center gap-1.5">
                <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Due Date
              </label>
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate('')}
                  className="text-[11px] font-semibold text-rpg-text-muted hover:text-red-400 transition-colors"
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {/* Quick 1-Click Date Presets */}
            <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1">
              {[
                {
                  label: 'Today',
                  getDate: () => {
                    const d = new Date();
                    return d.toISOString().slice(0, 10);
                  },
                },
                {
                  label: 'Tomorrow',
                  getDate: () => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    return d.toISOString().slice(0, 10);
                  },
                },
                {
                  label: 'This Weekend',
                  getDate: () => {
                    const d = new Date();
                    const day = d.getDay();
                    const diff = (6 - day + 7) % 7 || 7;
                    d.setDate(d.getDate() + diff);
                    return d.toISOString().slice(0, 10);
                  },
                },
                {
                  label: 'In 1 Week',
                  getDate: () => {
                    const d = new Date();
                    d.setDate(d.getDate() + 7);
                    return d.toISOString().slice(0, 10);
                  },
                },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    const datePart = preset.getDate();
                    const timePart = dueDate.includes('T') ? dueDate.split('T')[1] : '20:00';
                    setDueDate(`${datePart}T${timePart}`);
                  }}
                  className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg bg-rpg-surface-2 border border-white/5 hover:border-amber-500/40 hover:text-amber-300 text-rpg-text-muted transition-all active:scale-95 shrink-0"
                >
                  +{preset.label}
                </button>
              ))}
            </div>

            {/* Split Date & Time Inputs for crystal clarity */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input
                  id={`${baseId}-due-date`}
                  type="date"
                  value={dueDate ? dueDate.slice(0, 10) : ''}
                  onChange={(e) => {
                    const datePart = e.target.value;
                    if (!datePart) {
                      setDueDate('');
                      return;
                    }
                    const timePart = dueDate.includes('T') ? dueDate.split('T')[1] : '23:59';
                    setDueDate(`${datePart}T${timePart}`);
                  }}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2 rounded-rpg bg-rpg-bg border border-rpg-border hover:border-rpg-border-2 text-rpg-text text-sm outline-none transition-all focus:ring-2 focus:ring-rpg-gold/40 focus:border-rpg-gold/60 disabled:opacity-50 cursor-pointer"
                />
              </div>
              <div className="col-span-1">
                <input
                  id={`${baseId}-due-time`}
                  type="time"
                  value={dueDate.includes('T') ? dueDate.split('T')[1].slice(0, 5) : '23:59'}
                  onChange={(e) => {
                    const timePart = e.target.value || '23:59';
                    const datePart = dueDate ? dueDate.slice(0, 10) : new Date().toISOString().slice(0, 10);
                    setDueDate(`${datePart}T${timePart}`);
                  }}
                  disabled={isLoading}
                  className="w-full px-3 py-2 rounded-rpg bg-rpg-bg border border-rpg-border hover:border-rpg-border-2 text-rpg-text text-sm outline-none transition-all focus:ring-2 focus:ring-rpg-gold/40 focus:border-rpg-gold/60 disabled:opacity-50 cursor-pointer"
                />
              </div>
            </div>
            {dueDate && (
              <p className="text-[11px] text-amber-300 font-mono mt-1.5 flex items-center gap-1">
                <span className="text-emerald-400">✓</span> Due: {new Date(dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(dueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 px-5 rounded-rpg font-semibold text-rpg-bg bg-rpg-gradient-gold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-rpg-bg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>{isEdit ? 'Saving…' : 'Forging Quest…'}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
                    <line x1="13" y1="19" x2="19" y2="13" />
                  </svg>
                  <span>{isEdit ? 'Save Changes' : 'Forge Quest'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-rpg text-rpg-text-muted font-medium border border-rpg-border hover:bg-rpg-surface-2 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestFormModal;
