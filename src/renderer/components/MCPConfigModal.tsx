import React, { useState, useEffect } from 'react';
import type { MCPConfig } from '../../common/types';

interface MCPConfigModalProps {
  isOpen: boolean;
  config: MCPConfig | null;
  onClose: () => void;
}

type TransportType = 'native-sse' | 'legacy-bridge';
type ClientType = 'claude-desktop' | 'cursor' | 'windsurf' | 'cline' | 'custom';

export function MCPConfigModal({ isOpen, config, onClose }: MCPConfigModalProps) {
  const [copied, setCopied] = useState(false);
  const [transportType, setTransportType] = useState<TransportType>('native-sse');
  const [clientType, setClientType] = useState<ClientType>('claude-desktop');

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!isOpen || !config) return null;

  // Generate configuration based on transport and client type
  const generateConfig = () => {
    const baseUrl = `http://${config.host}:${config.port}`;
    const sseUrl = `${baseUrl}/sse`;
    const postUrl = `${baseUrl}/mcp`;

    if (transportType === 'native-sse') {
      // Modern native SSE transport
      const baseConfig = {
        transport: {
          type: 'sse',
          sseUrl,
          postUrl
        }
      };

      // Add client-specific metadata and options
      if (clientType === 'claude-desktop') {
        return {
          mcpServers: {
            lifeos: {
              ...baseConfig,
              transport: {
                ...baseConfig.transport,
                heartbeatMs: 15000,
                requestTimeoutMs: 30000
              },
              metadata: {
                name: 'LifeOS',
                version: '1.0.0',
                description: 'Personal life management system'
              },
              capabilities: {
                tools: true,
                resources: true
              }
            }
          }
        };
      } else if (clientType === 'cursor') {
        return {
          mcpServers: {
            lifeos: {
              ...baseConfig
            }
          }
        };
      } else if (clientType === 'windsurf') {
        return {
          mcpServers: {
            lifeos: {
              ...baseConfig,
              transport: {
                ...baseConfig.transport,
                retry: {
                  maxAttempts: 3,
                  backoffMs: 2000
                }
              },
              metadata: {
                name: 'LifeOS',
                description: 'Kanban, habits, notes, QA, activities tracking'
              },
              capabilities: {
                tools: true,
                resources: true
              }
            }
          }
        };
      } else {
        // Custom/generic SSE config
        return {
          mcpServers: {
            lifeos: baseConfig
          }
        };
      }
    } else {
      // Legacy bridge via mcp-remote
      if (clientType === 'cline') {
        return {
          'roo-cline.mcp.servers': {
            lifeos: {
              command: 'npx',
              args: ['-y', 'mcp-remote', postUrl]
            }
          }
        };
      } else {
        // Claude Desktop / generic legacy config
        return {
          mcpServers: {
            lifeos: {
              command: 'npx',
              args: ['-y', 'mcp-remote', postUrl]
            }
          }
        };
      }
    }
  };

  const configJson = generateConfig();
  const jsonString = JSON.stringify(configJson, null, 2);

  // Get configuration file path based on client type
  const getConfigPath = () => {
    if (transportType === 'native-sse') {
      switch (clientType) {
        case 'claude-desktop':
          return '%AppData%\\Claude\\config.json (Windows) or ~/Library/Application Support/Claude/config.json (macOS)';
        case 'cursor':
          return '.cursor/mcp.json in workspace or user config directory';
        case 'windsurf':
          return 'windsurf.config.json';
        default:
          return 'Client configuration file';
      }
    } else {
      switch (clientType) {
        case 'cline':
          return '.vscode/settings.json';
        case 'claude-desktop':
          return '%AppData%\\Claude\\config.json (Windows) or ~/Library/Application Support/Claude/config.json (macOS)';
        default:
          return 'Client configuration file';
      }
    }
  };

  // Get instructions based on transport and client
  const getInstructions = () => {
    if (transportType === 'native-sse') {
      return `Modern MCP clients support native SSE transport for direct HTTP/SSE communication without bridge processes. This is the recommended approach for better performance.`;
    } else {
      return `Legacy clients use mcp-remote bridge to translate stdio communication to HTTP. The bridge will be automatically downloaded via npx when the client starts.`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(3, 218, 198, 0.3)',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5rem' }}>
              MCP Client Configuration
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>

          {/* Server Info */}
          <div style={{ 
            background: 'rgba(3, 218, 198, 0.1)', 
            border: '1px solid rgba(3, 218, 198, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <strong>Server Running:</strong> <code style={{ background: 'rgba(3, 218, 198, 0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#03DAC6' }}>http://{config.host}:{config.port}</code>
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
              {getInstructions()}
            </div>
          </div>

          {/* Transport Type Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Transport Type:
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setTransportType('native-sse')}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: transportType === 'native-sse' ? '2px solid #03DAC6' : '1px solid rgba(255, 255, 255, 0.2)',
                  background: transportType === 'native-sse' ? 'rgba(3, 218, 198, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: transportType === 'native-sse' ? '#03DAC6' : 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: transportType === 'native-sse' ? 600 : 400,
                  transition: 'all 0.2s ease'
                }}
              >
                🚀 Native SSE (Recommended)
              </button>
              <button
                onClick={() => setTransportType('legacy-bridge')}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: transportType === 'legacy-bridge' ? '2px solid #03DAC6' : '1px solid rgba(255, 255, 255, 0.2)',
                  background: transportType === 'legacy-bridge' ? 'rgba(3, 218, 198, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: transportType === 'legacy-bridge' ? '#03DAC6' : 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: transportType === 'legacy-bridge' ? 600 : 400,
                  transition: 'all 0.2s ease'
                }}
              >
                🔗 Legacy Bridge (mcp-remote)
              </button>
            </div>
          </div>

          {/* Client Type Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Select Your MCP Client:
            </label>
            <select
              value={clientType}
              onChange={(e) => setClientType(e.target.value as ClientType)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: '#0f0f0f',
                color: '#fff',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {transportType === 'native-sse' ? (
                <>
                  <option value="claude-desktop">Claude Desktop (Latest)</option>
                  <option value="cursor">Cursor IDE</option>
                  <option value="windsurf">Windsurf</option>
                  <option value="custom">Custom Client</option>
                </>
              ) : (
                <>
                  <option value="claude-desktop">Claude Desktop (Older Versions)</option>
                  <option value="cline">Cline (VS Code)</option>
                  <option value="custom">Custom Client</option>
                </>
              )}
            </select>
          </div>

          {/* Configuration File Path */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
              📁 Configuration File: <code style={{ color: '#03DAC6', fontSize: '0.75rem' }}>{getConfigPath()}</code>
            </label>
          </div>

          {/* JSON Code Block */}
          <div
            style={{
              backgroundColor: '#0f0f0f',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              overflow: 'auto',
              maxHeight: '250px'
            }}
          >
            <code
              style={{
                color: '#03DAC6',
                fontFamily: 'Fira Code, monospace',
                fontSize: '0.8rem',
                lineHeight: 1.6,
                whiteSpace: 'pre',
                display: 'block'
              }}
            >
              {jsonString}
            </code>
          </div>

          {/* Setup Instructions */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              📝 Setup Instructions:
            </div>
            <ol style={{ margin: 0, paddingLeft: '1.5rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', lineHeight: 1.6 }}>
              <li>Copy the configuration above</li>
              <li>Open your client's configuration file (see path above)</li>
              <li>Paste the configuration into the file</li>
              <li>Save and restart your MCP client</li>
              {transportType === 'legacy-bridge' && (
                <li style={{ color: '#F59E0B' }}>mcp-remote will auto-install via npx on first use</li>
              )}
            </ol>
          </div>

          {/* Copy button */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={handleCopy}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: copied ? '#4CAF50' : '#03DAC6',
                color: copied ? '#fff' : '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 500,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!copied) {
                  e.currentTarget.style.backgroundColor = '#00A89F';
                }
              }}
              onMouseLeave={(e) => {
                if (!copied) {
                  e.currentTarget.style.backgroundColor = '#03DAC6';
                }
              }}
            >
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 500,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
