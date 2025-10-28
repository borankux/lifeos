import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../store/theme';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { MCPStatusIndicator } from '../components/MCPStatusIndicator';
import { MCPConfigModal } from '../components/MCPConfigModal';

export default function SettingsPage() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isLoaded = useThemeStore((s) => s.isLoaded);
  const [showPurgeDialog, setShowPurgeDialog] = useState(false);
  const [purgeStatus, setPurgeStatus] = useState<{ loading: boolean; error?: string }>({ loading: false });
  
  // MCP Server State
  const [mcpConfig, setMcpConfig] = useState<any>(null);
  const [mcpStatus, setMcpStatus] = useState<any>(null);
  const [mcpLoading, setMcpLoading] = useState(false);
  const [mcpError, setMcpError] = useState<string | null>(null);
  const [showPortInput, setShowPortInput] = useState(false);
  const [portValue, setPortValue] = useState('3000');
  const [showMcpConfigModal, setShowMcpConfigModal] = useState(false);

  // Load MCP config on mount
  useEffect(() => {
    loadMcpConfig();
  }, []);

  const loadMcpConfig = async () => {
    try {
      const response = await window.api.mcp.getConfig();
      if (response.ok && response.data) {
        setMcpConfig(response.data);
        setPortValue(String(response.data.port));
      }
    } catch (error) {
      console.error('Failed to load MCP config:', error);
    }
  };

  const loadMcpStatus = async () => {
    try {
      const response = await window.api.mcp.getStatus();
      if (response.ok) {
        setMcpStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to load MCP status:', error);
    }
  };

  const handleStartMCPServer = async () => {
    setMcpLoading(true);
    setMcpError(null);
    try {
      const response = await window.api.mcp.startServer();
      if (response.ok) {
        await loadMcpStatus();
        // Show config modal
        setShowMcpConfigModal(true);
        await window.api.notification.show({
          type: 'success',
          title: 'MCP Server Started',
          message: `MCP server is running on port ${mcpConfig?.port || 3000}`
        });
      } else {
        throw new Error(response.error || 'Failed to start MCP server');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to start MCP server';
      setMcpError(errorMsg);
      await window.api.notification.show({
        type: 'error',
        title: 'Failed to Start MCP Server',
        message: errorMsg
      });
    } finally {
      setMcpLoading(false);
    }
  };

  const handleStopMCPServer = async () => {
    setMcpLoading(true);
    setMcpError(null);
    try {
      const response = await window.api.mcp.stopServer();
      if (response.ok) {
        setMcpStatus({ running: false });
        await window.api.notification.show({
          type: 'success',
          title: 'MCP Server Stopped',
          message: 'MCP server has been stopped'
        });
      } else {
        throw new Error(response.error || 'Failed to stop MCP server');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to stop MCP server';
      setMcpError(errorMsg);
      await window.api.notification.show({
        type: 'error',
        title: 'Failed to Stop MCP Server',
        message: errorMsg
      });
    } finally {
      setMcpLoading(false);
    }
  };

  const handleUpdateMCPPort = async () => {
    const port = parseInt(portValue, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      setMcpError('Invalid port number. Please enter a value between 1 and 65535.');
      return;
    }

    setMcpLoading(true);
    setMcpError(null);
    try {
      const response = await window.api.mcp.updateConfig({ port });
      if (response.ok && response.data) {
        setMcpConfig(response.data);
        setShowPortInput(false);
        await window.api.notification.show({
          type: 'success',
          title: 'Port Updated',
          message: `MCP server port updated to ${port}. Note: Restart required to apply changes.`
        });
      } else {
        throw new Error(response.error || 'Failed to update port');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update port';
      setMcpError(errorMsg);
    } finally {
      setMcpLoading(false);
    }
  };

  const handleToggleAutoStart = async () => {
    setMcpLoading(true);
    setMcpError(null);
    try {
      const newAutoStart = !mcpConfig?.autoStart;
      const response = await window.api.mcp.updateConfig({ autoStart: newAutoStart });
      if (response.ok && response.data) {
        setMcpConfig(response.data);
        await window.api.notification.show({
          type: 'success',
          title: 'Auto-start Updated',
          message: `MCP server will ${newAutoStart ? 'auto-start' : 'not auto-start'} on app launch`
        });
      } else {
        throw new Error(response.error || 'Failed to update auto-start');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update auto-start';
      setMcpError(errorMsg);
    } finally {
      setMcpLoading(false);
    }
  };

  const handleToggleMCPEnabled = async () => {
    setMcpLoading(true);
    setMcpError(null);
    try {
      const newEnabled = !mcpConfig?.enabled;
      const response = await window.api.mcp.updateConfig({ enabled: newEnabled });
      if (response.ok && response.data) {
        setMcpConfig(response.data);
        await window.api.notification.show({
          type: 'success',
          title: 'MCP Status Updated',
          message: `MCP server is now ${newEnabled ? 'enabled' : 'disabled'}`
        });
      } else {
        throw new Error(response.error || 'Failed to update MCP status');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update MCP status';
      setMcpError(errorMsg);
    } finally {
      setMcpLoading(false);
    }
  };

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

      {/* MCP Server Management */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>MCP Server</h3>
        
        {mcpConfig && (
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {/* Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                  Server Status
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                  Monitor and control the MCP server
                </div>
              </div>
              <MCPStatusIndicator showLabel={true} size="medium" />
            </div>

            {/* Control Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleStartMCPServer}
                disabled={mcpLoading}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #10B981',
                  background: 'transparent',
                  color: '#10B981',
                  cursor: mcpLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  opacity: mcpLoading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!mcpLoading) {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {mcpLoading ? 'Starting...' : '▶ Start Server'}
              </button>
              
              <button
                onClick={handleStopMCPServer}
                disabled={mcpLoading}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #EF4444',
                  background: 'transparent',
                  color: '#EF4444',
                  cursor: mcpLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  opacity: mcpLoading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!mcpLoading) {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {mcpLoading ? 'Stopping...' : '⏹ Stop Server'}
              </button>
            </div>

            {/* Port Configuration */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                Server Port
              </div>
              {!showPortInput ? (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      fontFamily: 'monospace'
                    }}
                  >
                    {mcpConfig?.port || 3000}
                  </div>
                  <button
                    onClick={() => setShowPortInput(true)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid var(--card-border)',
                      background: 'var(--bg)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--card-bg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg)';
                    }}
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min="1"
                    max="65535"
                    value={portValue}
                    onChange={(e) => setPortValue(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid var(--card-border)',
                      background: 'var(--bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace'
                    }}
                  />
                  <button
                    onClick={handleUpdateMCPPort}
                    disabled={mcpLoading}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid #10B981',
                      background: 'transparent',
                      color: '#10B981',
                      cursor: mcpLoading ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!mcpLoading) {
                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowPortInput(false)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid var(--card-border)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Auto-start toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Auto-start on Launch
                </div>
              </div>
              <button
                onClick={handleToggleAutoStart}
                disabled={mcpLoading}
                style={{
                  width: '50px',
                  height: '28px',
                  borderRadius: '14px',
                  border: 'none',
                  background: mcpConfig?.autoStart ? '#10B981' : '#6B7280',
                  cursor: mcpLoading ? 'not-allowed' : 'pointer',
                  position: 'relative',
                  opacity: mcpLoading ? 0.6 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    top: '3px',
                    left: mcpConfig?.autoStart ? '25px' : '3px',
                    transition: 'left 0.3s ease'
                  }}
                ></div>
              </button>
            </div>

            {/* Error Message */}
            {mcpError && (
              <div
                style={{
                  padding: '0.75rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #EF4444',
                  borderRadius: '6px',
                  color: '#EF4444',
                  fontSize: '0.875rem'
                }}
              >
                {mcpError}
              </div>
            )}
          </div>
        )}
      </section>
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
      
      <MCPConfigModal
        isOpen={showMcpConfigModal}
        config={mcpConfig}
        onClose={() => setShowMcpConfigModal(false)}
      />
    </div>
  );
}
