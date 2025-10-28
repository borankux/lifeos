import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../store/theme';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { MCPStatusIndicator } from '../components/MCPStatusIndicator';
import { MCPConfigModal } from '../components/MCPConfigModal';
import { ServerLogsViewer } from '../components/ServerLogsViewer';

type SettingsTab = 'appearance' | 'mcp-server' | 'database';

const TABS = [
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'mcp-server', label: 'MCP Server', icon: '⚙️' },
  { id: 'database', label: 'Database', icon: '💾' }
];

export default function SettingsPage() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [showPurgeDialog, setShowPurgeDialog] = useState(false);
  const [purgeStatus, setPurgeStatus] = useState<any>({ loading: false });
  const [mcpConfig, setMcpConfig] = useState<any>(null);
  const [mcpLoading, setMcpLoading] = useState(false);
  const [mcpError, setMcpError] = useState<string | null>(null);
  const [showPortInput, setShowPortInput] = useState(false);
  const [portValue, setPortValue] = useState('3000');
  const [copied, setCopied] = useState(false);

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

  const handleStartMCPServer = async () => {
    setMcpLoading(true);
    setMcpError(null);
    try {
      const response = await window.api.mcp.startServer();
      if (response.ok) {
        await window.api.notification.show({
          type: 'success',
          title: 'MCP Server Started',
          message: `Running on port ${mcpConfig?.port || 3000}`
        });
      } else {
        throw new Error(response.error || 'Failed');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to start';
      setMcpError(errorMsg);
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
        await window.api.notification.show({
          type: 'success',
          title: 'MCP Server Stopped',
          message: 'Server stopped'
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed';
      setMcpError(errorMsg);
    } finally {
      setMcpLoading(false);
    }
  };

  const handleUpdateMCPPort = async () => {
    const port = parseInt(portValue, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      setMcpError('Invalid port');
      return;
    }
    setMcpLoading(true);
    try {
      const response = await window.api.mcp.updateConfig({ port });
      if (response.ok && response.data) {
        setMcpConfig(response.data);
        setShowPortInput(false);
        await window.api.notification.show({
          type: 'success',
          title: 'Port Updated',
          message: `Port: ${port}`
        });
      }
    } catch (error) {
      setMcpError('Failed to update');
    } finally {
      setMcpLoading(false);
    }
  };

  const handleToggleAutoStart = async () => {
    setMcpLoading(true);
    try {
      const newAutoStart = !mcpConfig?.autoStart;
      const response = await window.api.mcp.updateConfig({ autoStart: newAutoStart });
      if (response.ok && response.data) {
        setMcpConfig(response.data);
      }
    } catch (error) {
      setMcpError('Failed');
    } finally {
      setMcpLoading(false);
    }
  };

  const copyMcpConfig = async () => {
    if (!mcpConfig) return;
    const config = {
      mcpServers: {
        "lifeos-mcp": {
          "command": "node",
          "args": ["/path/to/lifeos/dist/server/mcp-server.js"],
          "env": {
            "MCP_SERVER_PORT": mcpConfig.port,
            "MCP_SERVER_HOST": mcpConfig.host
          }
        }
      }
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setMcpError('Copy failed');
    }
  };

  const handlePurgeDatabase = async () => {
    setPurgeStatus({ loading: true });
    try {
      const response = await window.api.database.purge();
      if (response.ok) {
        await window.api.notification.show({
          type: 'success',
          title: 'Database Purged',
          message: 'All data removed'
        });
        window.location.reload();
      }
    } catch (error) {
      setPurgeStatus({ loading: false, error: 'Failed' });
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 0, userSelect: 'none', WebkitUserSelect: 'none' }}>
      <div style={{
        width: '200px',
        background: 'var(--card-bg)',
        borderRight: '1px solid var(--card-border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid var(--card-border)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>⚙️ Settings</h2>
        </div>
        
        <nav style={{ flex: 1, overflow: 'auto', padding: '0.5rem' }}>
          {TABS.map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: 'none',
                background: activeTab === tab.id ? 'rgba(3, 218, 198, 0.1)' : 'transparent',
                color: activeTab === tab.id ? '#03DAC6' : 'var(--text-secondary)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: activeTab === tab.id ? 600 : 500,
                marginBottom: '0.5rem',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'appearance' && (
          <div style={{ padding: '2rem', flex: 1, overflow: 'auto' }}>
            <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)', marginTop: 0 }}>Appearance</h2>
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Theme</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Light/Dark Mode</div>
              </div>
              <div onClick={toggleTheme} style={{
                width: '60px', height: '32px', borderRadius: '16px',
                background: theme === 'dark' ? '#6200EE' : '#03DAC6',
                position: 'relative', cursor: 'pointer'
              }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: '#fff', position: 'absolute', top: '4px',
                  left: theme === 'dark' ? '4px' : 'calc(100% - 28px)',
                  transition: 'left 0.3s'
                }}>{theme === 'dark' ? '🌙' : '☀️'}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mcp-server' && (
          <div style={{ 
            padding: '2rem', 
            display: 'flex', 
            flexDirection: 'column', 
            flex: 1,
            overflow: 'hidden',
            minHeight: 0
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>MCP Server</h2>

            {mcpConfig && (
              <>
                {/* Status & Controls Card - Fixed Height */}
                <div style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  flexShrink: 0
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>Server Status</div>
                    <MCPStatusIndicator showLabel={true} size="medium" />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button 
                      onClick={handleStartMCPServer} 
                      disabled={mcpLoading} 
                      style={{
                        padding: '0.5rem 1.5rem', 
                        borderRadius: '8px', 
                        border: '1px solid #10B981',
                        background: mcpLoading ? 'transparent' : 'rgba(16, 185, 129, 0.1)',
                        color: '#10B981', 
                        cursor: mcpLoading ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease',
                        opacity: mcpLoading ? 0.5 : 1
                      }}
                    >
                      {mcpLoading ? '⏳ Starting...' : '▶ Start Server'}
                    </button>
                    <button 
                      onClick={handleStopMCPServer} 
                      disabled={mcpLoading} 
                      style={{
                        padding: '0.5rem 1.5rem', 
                        borderRadius: '8px', 
                        border: '1px solid #EF4444',
                        background: mcpLoading ? 'transparent' : 'rgba(239, 68, 68, 0.1)',
                        color: '#EF4444', 
                        cursor: mcpLoading ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease',
                        opacity: mcpLoading ? 0.5 : 1
                      }}
                    >
                      {mcpLoading ? '⏳ Stopping...' : '⏹ Stop Server'}
                    </button>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--card-border)'
                  }}>
                    {/* Port Configuration */}
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Port</div>
                      {!showPortInput ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <div style={{ 
                            background: 'var(--bg)', 
                            border: '1px solid var(--card-border)', 
                            borderRadius: '6px', 
                            padding: '0.5rem 1rem', 
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            color: '#03DAC6'
                          }}>
                            {mcpConfig?.port || 3000}
                          </div>
                          <button 
                            onClick={() => setShowPortInput(true)} 
                            style={{ 
                              padding: '0.5rem 1rem', 
                              borderRadius: '6px', 
                              border: '1px solid var(--card-border)', 
                              cursor: 'pointer',
                              background: 'transparent',
                              color: 'var(--text-primary)',
                              fontSize: '0.75rem'
                            }}
                          >
                            ✏️ Edit
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
                              fontFamily: 'monospace'
                            }} 
                          />
                          <button 
                            onClick={handleUpdateMCPPort} 
                            style={{ 
                              padding: '0.5rem 1rem', 
                              borderRadius: '6px', 
                              border: '1px solid #10B981', 
                              color: '#10B981', 
                              cursor: 'pointer',
                              background: 'transparent',
                              fontSize: '0.75rem'
                            }}
                          >
                            ✓
                          </button>
                          <button 
                            onClick={() => setShowPortInput(false)} 
                            style={{ 
                              padding: '0.5rem 1rem', 
                              borderRadius: '6px', 
                              border: '1px solid var(--card-border)', 
                              cursor: 'pointer',
                              background: 'transparent',
                              color: 'var(--text-primary)',
                              fontSize: '0.75rem'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Auto-start Toggle */}
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Auto-start</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button 
                          onClick={handleToggleAutoStart} 
                          style={{
                            width: '50px', 
                            height: '28px', 
                            borderRadius: '14px', 
                            border: 'none',
                            background: mcpConfig?.autoStart ? '#10B981' : '#6B7280', 
                            cursor: 'pointer', 
                            position: 'relative',
                            transition: 'background 0.3s ease'
                          }}
                        >
                          <div style={{
                            width: '22px', 
                            height: '22px', 
                            borderRadius: '50%', 
                            background: '#fff', 
                            position: 'absolute',
                            top: '3px', 
                            left: mcpConfig?.autoStart ? '25px' : '3px', 
                            transition: 'left 0.3s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}></div>
                        </button>
                        <span style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: 600,
                          color: mcpConfig?.autoStart ? '#10B981' : '#6B7280'
                        }}>
                          {mcpConfig?.autoStart ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--card-border)'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Connection Info</div>
                    <div style={{ 
                      background: 'var(--bg)', 
                      border: '1px solid var(--card-border)', 
                      borderRadius: '6px',
                      padding: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <code style={{ 
                        fontSize: '0.75rem', 
                        fontFamily: 'monospace',
                        color: '#03DAC6'
                      }}>
                        http://{mcpConfig?.host || 'localhost'}:{mcpConfig?.port || 3000}/mcp
                      </code>
                      <button 
                        onClick={copyMcpConfig} 
                        style={{
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '4px', 
                          border: '1px solid #03DAC6',
                          color: '#03DAC6', 
                          cursor: 'pointer',
                          background: 'transparent',
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }}
                      >
                        {copied ? '✓ Copied' : '📋 Copy Config'}
                      </button>
                    </div>
                  </div>

                  {mcpError && (
                    <div style={{ 
                      marginTop: '1rem', 
                      padding: '0.75rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid #EF4444',
                      borderRadius: '6px',
                      color: '#EF4444',
                      fontSize: '0.875rem'
                    }}>
                      ⚠️ {mcpError}
                    </div>
                  )}
                </div>

                {/* Logs Viewer - Takes Remaining Space */}
                <div style={{ 
                  flex: 1, 
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0
                }}>
                  <div style={{ 
                    fontSize: '1rem', 
                    fontWeight: 600, 
                    marginBottom: '1rem',
                    color: 'var(--text-primary)'
                  }}>
                    📊 Server Logs
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden', minHeight: '300px' }}>
                    <ServerLogsViewer autoRefresh={true} refreshInterval={5000} />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'database' && (
          <div style={{ padding: '2rem', flex: 1, overflow: 'auto' }}>
            <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)', marginTop: 0 }}>Database</h2>
            <div style={{
              background: 'var(--card-bg)', border: '1px solid var(--card-border)',
              borderRadius: '12px', padding: '1.5rem'
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Purge Data</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>Permanently delete all data</div>
              <button onClick={() => setShowPurgeDialog(true)} disabled={purgeStatus.loading} style={{
                padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #CF6679', color: '#CF6679', cursor: 'pointer'
              }}>Purge</button>
              {purgeStatus.error && <div style={{ marginTop: '1rem', color: '#EF4444' }}>{purgeStatus.error}</div>}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showPurgeDialog}
        title="Purge Database"
        message="Permanently delete all data? Cannot be undone."
        confirmText="Yes, Purge"
        cancelText="Cancel"
        type="danger"
        onConfirm={handlePurgeDatabase}
        onCancel={() => setShowPurgeDialog(false)}
      />
      
      <MCPConfigModal isOpen={false} config={mcpConfig} onClose={() => {}} />
    </div>
  );
}
