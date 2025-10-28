import React, { useEffect, useState } from 'react';

type MCPStatus = 'running' | 'stopped' | 'loading' | 'error';

interface MCPStatusIndicatorProps {
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function MCPStatusIndicator({ showLabel = false, size = 'small' }: MCPStatusIndicatorProps) {
  const [status, setStatus] = useState<MCPStatus>('loading');
  const [uptime, setUptime] = useState<number>(0);

  // Poll status every 2 seconds
  useEffect(() => {
    let isMounted = true;

    const pollStatus = async () => {
      try {
        // Check if API is available
        if (!window.api || !window.api.mcp) {
          if (isMounted) {
            setStatus('error');
          }
          return;
        }
        
        const response = await window.api.mcp.getStatus();
        if (isMounted) {
          if (response.ok && response.data) {
            setStatus(response.data.running ? 'running' : 'stopped');
            if (response.data.uptime) {
              setUptime(response.data.uptime);
            }
          } else {
            setStatus('error');
          }
        }
      } catch (error) {
        if (isMounted) {
          setStatus('error');
        }
      }
    };

    // Initial poll
    pollStatus();

    // Set up interval
    const interval = setInterval(pollStatus, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Color mapping for different statuses
  const colorMap: Record<MCPStatus, string> = {
    running: '#10B981', // Green
    stopped: '#EF4444', // Red
    loading: '#F59E0B', // Yellow
    error: '#EF4444' // Red
  };

  const labelMap: Record<MCPStatus, string> = {
    running: 'MCP Running',
    stopped: 'MCP Stopped',
    loading: 'Loading...',
    error: 'MCP Error'
  };

  const sizeMap = {
    small: { width: 8, height: 8 },
    medium: { width: 12, height: 12 },
    large: { width: 16, height: 16 }
  };

  const dotSize = sizeMap[size];
  const color = colorMap[status];
  const label = labelMap[status];

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    userSelect: 'none'
  };

  const dotStyle: React.CSSProperties = {
    width: `${dotSize.width}px`,
    height: `${dotSize.height}px`,
    borderRadius: '50%',
    backgroundColor: color,
    boxShadow: `0 0 ${size === 'small' ? 4 : 8}px ${color}`,
    animation: status === 'loading' || status === 'running' ? 'pulse 2s infinite' : 'none',
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
    fontWeight: 500,
    whiteSpace: 'nowrap'
  };

  return (
    <div style={containerStyle} title={`${label} (${status === 'running' ? `uptime: ${formatUptime(uptime)}` : 'offline'})`}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <div style={dotStyle}></div>
      {showLabel && <span style={labelStyle}>{label}</span>}
    </div>
  );
}

export default MCPStatusIndicator;
