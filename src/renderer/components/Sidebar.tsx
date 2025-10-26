import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const linkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: isCollapsed ? '0.6rem' : '0.6rem 0.75rem',
    borderRadius: '8px',
    background: isActive ? 'rgba(3,218,198,0.08)' : 'transparent',
    color: isActive ? '#03DAC6' : 'inherit',
    textDecoration: 'none',
    marginBottom: '0.25rem',
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  });

  const iconStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    flexShrink: 0,
    width: '1.25rem',
    textAlign: 'center'
  };

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', height: '100%', userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: '0.6rem 0.75rem',
          marginBottom: '1rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          color: 'inherit',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        }}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <span style={{ fontSize: '1.25rem' }}>{isCollapsed ? '☰' : '‹'}</span>
        {!isCollapsed && <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Collapse</span>}
      </button>

      {/* Navigation links */}
      <div style={{ flex: 1 }}>
        <NavLink to="/dashboard" style={linkStyle} title="Dashboard">
          <span style={iconStyle}>📊</span>
          {!isCollapsed && <span>Dashboard</span>}
        </NavLink>
        <NavLink to="/kanban" style={linkStyle} title="Kanban">
          <span style={iconStyle}>📋</span>
          {!isCollapsed && <span>Kanban</span>}
        </NavLink>
        <NavLink to="/notebook" style={linkStyle} title="Notebook">
          <span style={iconStyle}>📓</span>
          {!isCollapsed && <span>Notebook</span>}
        </NavLink>
        <NavLink to="/habits" style={linkStyle} title="Habits">
          <span style={iconStyle}>✓</span>
          {!isCollapsed && <span>Habits</span>}
        </NavLink>
        <NavLink to="/qa" style={linkStyle} title="Q & A">
          <span style={iconStyle}>❓</span>
          {!isCollapsed && <span>Q & A</span>}
        </NavLink>
      </div>

      {/* Settings at the bottom */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Quick Access Floating Buttons */}
        {!isCollapsed && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '0.5rem',
            padding: '0 0.5rem 1rem 0.5rem',
            marginBottom: '0.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ 
              fontSize: '0.75rem', 
              color: 'var(--text-tertiary)', 
              fontWeight: 500,
              padding: '0 0.25rem'
            }}>
              Quick Actions
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => window.location.hash = '/qa'}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--card-border)',
                  background: 'linear-gradient(135deg, #6200EE 0%, #3700B3 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                ❓ Ask
              </button>
              
              <button
                onClick={() => window.location.hash = '/notebook'}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--card-border)',
                  background: 'linear-gradient(135deg, #03DAC6 0%, #018786 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                📓 Note
              </button>
              
              <button
                onClick={() => window.location.hash = '/kanban'}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--card-border)',
                  background: 'linear-gradient(135deg, #FF5252 0%, #B71C1C 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                ✅ Task
              </button>
            </div>
          </div>
        )}
        <NavLink to="/settings" style={linkStyle} title="Settings">
          <span style={iconStyle}>⚙️</span>
          {!isCollapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </nav>
  );
}

export default Sidebar;
