import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '⚠️',
          confirmButton: {
            background: '#CF6679',
            hoverBackground: '#B75A67'
          }
        };
      case 'warning':
        return {
          icon: '⚠️',
          confirmButton: {
            background: '#FF9800',
            hoverBackground: '#E68900'
          }
        };
      default:
        return {
          icon: 'ℹ️',
          confirmButton: {
            background: '#03DAC6',
            hoverBackground: '#02BDB3'
          }
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={handleBackdropClick}
    >
      <div 
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '1.5rem',
          width: '90%',
          maxWidth: '400px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '1.5rem' }}>{styles.icon}</div>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>{title}</h3>
        </div>
        
        <div style={{ 
          color: 'var(--text-secondary)', 
          marginBottom: '1.5rem',
          lineHeight: '1.5'
        }}>
          {message}
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--card-border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {cancelText}
          </button>
          
          <button
            onClick={handleConfirm}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: styles.confirmButton.background,
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = styles.confirmButton.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = styles.confirmButton.background;
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
    </div>
  );
}