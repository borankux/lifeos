import React, { useState, useEffect } from 'react';
import type { MCPConfig } from '../../common/types';

interface MCPConfigModalProps {
  isOpen: boolean;
  config: MCPConfig | null;
  onClose: () => void;
}

export function MCPConfigModal({ isOpen, config, onClose }: MCPConfigModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!isOpen || !config) return null;

  const configJson = {
    server: {
      host: config.host,
      port: config.port,
      enabled: config.enabled,
      autoStart: config.autoStart
    },
    endpoints: {
      base: `http://${config.host}:${config.port}`
    }
  };

  const jsonString = JSON.stringify(configJson, null, 2);

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
              MCP Server Configuration
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

          {/* Info text */}
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Copy this configuration JSON and provide it to your MCP client or agent:
          </p>

          {/* JSON Code Block */}
          <div
            style={{
              backgroundColor: '#0f0f0f',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              overflow: 'auto',
              maxHeight: '300px'
            }}
          >
            <code
              style={{
                color: '#03DAC6',
                fontFamily: 'Fira Code, monospace',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                whiteSpace: 'pre',
                display: 'block'
              }}
            >
              {jsonString}
            </code>
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
