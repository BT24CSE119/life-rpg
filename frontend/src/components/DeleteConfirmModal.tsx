import React from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Delete confirmation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative w-full max-w-sm bg-rpg-surface border border-rpg-border rounded-rpg-lg shadow-2xl shadow-black/50 animate-scale-in p-6">
        <div className="text-center mb-5">
          <div className="text-4xl mb-3" aria-hidden="true">⚠️</div>
          <h3 className="font-display text-lg font-bold text-rpg-text mb-2">
            Delete Quest?
          </h3>
          <p className="text-sm text-rpg-text-muted">
            Are you sure you want to delete{' '}
            <span className="text-rpg-text font-medium">"{title}"</span>?
            This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-rpg font-semibold text-white bg-rpg-danger hover:bg-rpg-danger/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin" aria-hidden="true">⚙️</span>
                Deleting…
              </>
            ) : (
              <>🗑️ Delete</>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-rpg text-rpg-text-muted font-medium border border-rpg-border hover:bg-rpg-surface-2 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
