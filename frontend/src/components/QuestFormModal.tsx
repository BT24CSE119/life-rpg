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
  const [priority, setPriority] = useState<QuestPriority>('MEDIUM');
  const [status, setStatus] = useState('TODO');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<{ title?: string; general?: string }>({});

  // Pre-fill when editing
  useEffect(() => {
    if (quest) {
      setTitle(quest.title);
      setDescription(quest.description ?? '');
      setPriority(quest.priority);
      setStatus(quest.status);
      setDueDate(quest.dueDate ? quest.dueDate.slice(0, 16) : '');
    } else {
      setTitle('');
      setDescription('');
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
          priority,
          status: status as UpdateQuestInput['status'],
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        };
        await onSubmit(updateData);
      } else {
        const createData: CreateQuestInput = {
          title: trimmedTitle,
          description: description.trim() || undefined,
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
          <h2 id={`${baseId}-title`} className="font-display text-xl font-bold text-rpg-text">
            {isEdit ? '✏️ Edit Quest' : '⚔️ New Quest'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-rpg-text-muted hover:text-rpg-text transition-colors text-lg p-1"
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

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-rpg-text-muted mb-1.5">
              Priority
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

          {/* Due Date */}
          <div>
            <label htmlFor={`${baseId}-due`} className="block text-sm font-medium text-rpg-text-muted mb-1.5">
              Due Date
            </label>
            <input
              id={`${baseId}-due`}
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-rpg bg-rpg-bg border border-rpg-border text-rpg-text text-sm outline-none transition-all focus:ring-2 focus:ring-rpg-gold/40 focus:border-rpg-gold/60 disabled:opacity-50"
            />
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
                  <span className="animate-spin" aria-hidden="true">⚙️</span>
                  {isEdit ? 'Saving…' : 'Creating…'}
                </>
              ) : (
                <>
                  {isEdit ? '💾 Save Changes' : '⚔️ Create Quest'}
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
