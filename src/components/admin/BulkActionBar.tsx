import React, { useState } from 'react';
import { Trash2, X, CheckSquare, AlertTriangle, Loader2 } from 'lucide-react';

export interface BulkActionBarProps {
  selectedCount: number;
  totalCount?: number;
  itemLabel?: string;
  label?: string;
  onSelectAll?: () => void;
  onDeselectAll: () => void;
  onConfirmDelete?: () => Promise<void> | void;
  onBulkDelete?: () => Promise<void> | void;
  isDeleting?: boolean;
  isProcessing?: boolean;
  deleteButtonLabel?: string;
  modalTitle?: string;
  modalMessage?: string;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  totalCount,
  itemLabel = 'items',
  label,
  onSelectAll,
  onDeselectAll,
  onConfirmDelete,
  onBulkDelete,
  isDeleting = false,
  isProcessing = false,
  deleteButtonLabel = 'Delete Selected',
  modalTitle = 'Confirm Bulk Deletion',
  modalMessage,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (selectedCount <= 0) return null;

  const resolvedLabel = label || itemLabel;
  const resolvedIsDeleting = isDeleting || isProcessing;
  const executeDelete = onConfirmDelete || onBulkDelete;

  const defaultMessage = modalMessage || `Are you sure you want to delete the selected items? This action cannot be undone.`;

  const handleExecute = async () => {
    if (!executeDelete) return;
    try {
      await executeDelete();
      setShowConfirmModal(false);
    } catch {
      // Keep modal open or handle failure in parent
    }
  };

  return (
    <>
      {/* Floating Bulk Action Bar */}
      <aside
        aria-label="Bulk actions toolbar"
        style={{
          position: 'sticky',
          bottom: '1.25rem',
          zIndex: 900,
          margin: '1.5rem auto 1rem',
          width: 'calc(100% - 1.5rem)',
          maxWidth: '850px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 20px 35px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '0.85rem 1.25rem',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          backdropFilter: 'blur(10px)',
          animation: 'slideUp 0.25s ease-out',
        }}
      >
        {/* Left: Counter & Select/Deselect All */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(147, 51, 234, 0.25)',
              border: '1px solid rgba(192, 132, 252, 0.4)',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#F3E8FF',
            }}
          >
            <CheckSquare size={15} style={{ color: '#C084FC' }} />
            <span>
              {selectedCount} {selectedCount === 1 ? resolvedLabel.replace(/s$/, '') : resolvedLabel} selected
            </span>
          </div>

          {onSelectAll && totalCount && selectedCount < totalCount && (
            <button
              type="button"
              onClick={onSelectAll}
              disabled={resolvedIsDeleting}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#E2E8F0',
                padding: '0.35rem 0.7rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Select All ({totalCount})
            </button>
          )}

          <button
            type="button"
            onClick={onDeselectAll}
            disabled={resolvedIsDeleting}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              padding: '0.35rem 0.5rem',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <X size={13} /> Deselect
          </button>
        </div>

        {/* Right: Bulk Delete Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={resolvedIsDeleting}
            style={{
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#FFFFFF',
              borderRadius: '10px',
              padding: '0.5rem 1.1rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: resolvedIsDeleting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
              opacity: resolvedIsDeleting ? 0.7 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            {resolvedIsDeleting ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 size={15} /> {deleteButtonLabel}
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-delete-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !resolvedIsDeleting) setShowConfirmModal(false);
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              width: '100%',
              maxWidth: '460px',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: '#EF4444',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h3
              id="bulk-delete-title"
              style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}
            >
              {modalTitle}
            </h3>

            <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              {modalMessage || defaultMessage}
            </p>

            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FEE2E2',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
                fontSize: '0.8rem',
                color: '#991B1B',
                fontWeight: 600,
              }}
            >
              ⚠️ Permanent Action: {selectedCount} {selectedCount === 1 ? resolvedLabel.replace(/s$/, '') : resolvedLabel} will be deleted.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={resolvedIsDeleting}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.65rem', justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecute}
                disabled={resolvedIsDeleting}
                className="btn"
                style={{
                  flex: 1,
                  background: '#DC2626',
                  color: '#FFFFFF',
                  padding: '0.65rem',
                  fontWeight: 700,
                  justifyContent: 'center',
                  border: 'none',
                }}
              >
                {resolvedIsDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Processing...
                  </>
                ) : (
                  `Delete ${selectedCount} ${resolvedLabel}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActionBar;
