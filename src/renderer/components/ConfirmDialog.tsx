import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getColor = () => {
    switch (type) {
      case 'danger':
        return '#FF5252';
      case 'warning':
        return '#FF9800';
      default:
        return '#03DAC6';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Dialog */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--bg-primary)',
            borderRadius: '16px',
            padding: '2rem',
            minWidth: '400px',
            maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: `2px solid ${getColor()}30`,
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          {/* Icon & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `${getColor()}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0
              }}
            >
              {type === 'danger' ? '⚠️' : type === 'warning' ? '⚡' : 'ℹ️'}
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)'
              }}
            >
              {title}
            </h2>
          </div>

          {/* Message */}
          <p
            style={{
              margin: '0 0 2rem 0',
              fontSize: '1rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)'
            }}
          >
            {message}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '2px solid var(--card-border)',
                background: 'var(--card-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--hover-bg)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--card-bg)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: getColor(),
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${getColor()}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default ConfirmDialog;
