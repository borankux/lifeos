import React, { useEffect } from 'react';
import { useThemeStore } from '../../store/theme';

export default function SettingsPage() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isLoaded = useThemeStore((s) => s.isLoaded);

  return (
    <div style={{ padding: '2rem', userSelect: 'none', WebkitUserSelect: 'none' }}>
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
    </div>
  );
}
