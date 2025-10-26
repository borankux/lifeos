import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../store/theme';
import { ConfirmDialog } from '../components/ConfirmDialog';

export default function SettingsPage() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isLoaded = useThemeStore((s) => s.isLoaded);
  const [showPurgeDialog, setShowPurgeDialog] = useState(false);
  const [purgeStatus, setPurgeStatus] = useState<{ loading: boolean; error?: string }>({ loading: false });

  const handlePurgeDatabase = async () => {
    setPurgeStatus({ loading: true });
    try {
      const response = await window.api.database.purge();
      if (response.ok) {
        setPurgeStatus({ loading: false });
        // Show success notification
        await window.api.notification.show({
          type: 'success',
          title: 'Database Purged',
          message: 'All data has been successfully removed from the database.'
        });
        // Reload the window to reflect changes
        window.location.reload();
      } else {
        throw new Error(response.error || 'Failed to purge database');
      }
    } catch (error) {
      console.error('Failed to purge database:', error);
      setPurgeStatus({ loading: false, error: error instanceof Error ? error.message : 'Failed to purge database' });
      await window.api.notification.show({
        type: 'error',
        title: 'Purge Failed',
        message: error instanceof Error ? error.message : 'Failed to purge database'
      });
    }
  };

  return (
    <div style={{ padding: '2rem', userSelect: 'none', WebkitUserSelect: 'none' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Settings</h2>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Appearance</h3>
        
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
              Theme
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
              Switch between light and dark mode
            </div>
          </div>

          {/* Theme Toggle Switch */}
          <div
            onClick={toggleTheme}
            style={{
              width: '60px',
              height: '32px',
              borderRadius: '16px',
              background: theme === 'dark' ? '#6200EE' : '#03DAC6',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              padding: '0 4px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#ffffff',
                position: 'absolute',
                left: theme === 'dark' ? '4px' : 'calc(100% - 28px)',
                transition: 'left 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
              }}
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: theme === 'dark' ? 'rgba(3, 218, 198, 0.1)' : 'rgba(98, 0, 238, 0.1)',
            border: `1px solid ${theme === 'dark' ? 'rgba(3, 218, 198, 0.3)' : 'rgba(98, 0, 238, 0.3)'}`,
            borderRadius: '8px',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-primary)'
          }}
        >
          <span>💡</span>
          <span>Current theme: <strong>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong></span>
        </div>
      </section>

      {/* Database Management */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Database Management</h3>
        
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            padding: '1.5rem',
          }}
        >
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
              Purge Database
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
              Remove all data from the database. This action cannot be undone.
            </div>
            
            <button
              onClick={() => setShowPurgeDialog(true)}
              disabled={purgeStatus.loading}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #CF6679',
                background: 'transparent',
                color: '#CF6679',
                cursor: purgeStatus.loading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (!purgeStatus.loading) {
                  e.currentTarget.style.background = 'rgba(199, 56, 84, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {purgeStatus.loading ? (
                <>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid #CF6679',
                    borderRightColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Purging...
                </>
              ) : (
                '⚠️ Purge All Data'
              )}
            </button>
            
            {purgeStatus.error && (
              <div style={{ 
                marginTop: '0.75rem', 
                padding: '0.5rem', 
                background: 'rgba(199, 56, 84, 0.1)', 
                border: '1px solid #CF6679', 
                borderRadius: '6px', 
                color: '#CF6679',
                fontSize: '0.875rem'
              }}>
                {purgeStatus.error}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Future settings sections */}
      <section style={{ opacity: 0.5 }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Notifications</h3>
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            opacity: 0.6,
            color: 'var(--text-tertiary)'
          }}
        >
          Coming soon...
        </div>
      </section>
      
      <ConfirmDialog
        isOpen={showPurgeDialog}
        title="Purge Database"
        message="This will permanently delete all projects, tasks, notes, questions, and other data. This action cannot be undone. Are you sure you want to continue?"
        confirmText="Yes, Purge Everything"
        cancelText="Cancel"
        type="danger"
        onConfirm={handlePurgeDatabase}
        onCancel={() => setShowPurgeDialog(false)}
      />
    </div>
  );
}
