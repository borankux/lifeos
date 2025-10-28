import React, { useEffect, useState } from 'react';

interface ServerLog {
  id: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
  created_at: string;
}

interface Props {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function ServerLogsViewer({ autoRefresh = true, refreshInterval = 5000 }: Props) {
  const [logs, setLogs] = useState<ServerLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [levelFilters, setLevelFilters] = useState<Set<string>>(new Set(['debug', 'info', 'warn', 'error']));
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefresh);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const [selectedInterval, setSelectedInterval] = useState(refreshInterval);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await window.api.serverLogs.get({ limit: 200 });
      if (response.ok) {
        setLogs(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Failed to load logs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await window.api.serverLogs.getStats();
      if (response.ok) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  // Filter logs locally
  const filteredLogs = logs.filter(log => {
    // Level filter
    if (!levelFilters.has(log.level)) return false;
    
    // Search filter
    if (searchText) {
      const search = searchText.toLowerCase();
      const messageMatch = log.message.toLowerCase().includes(search);
      const dataMatch = log.data && JSON.stringify(log.data).toLowerCase().includes(search);
      if (!messageMatch && !dataMatch) return false;
    }
    
    return true;
  });

  useEffect(() => {
    loadLogs();
    loadStats();
  }, []);

  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      loadLogs();
      loadStats();
    }, selectedInterval);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, selectedInterval]);

  const toggleLevelFilter = (level: string) => {
    const newFilters = new Set(levelFilters);
    if (newFilters.has(level)) {
      newFilters.delete(level);
    } else {
      newFilters.add(level);
    }
    setLevelFilters(newFilters);
  };

  const toggleLogExpansion = (id: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedLogs(newExpanded);
  };

  const exportLogs = (format: 'json' | 'csv' | 'txt') => {
    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'json') {
      content = JSON.stringify(filteredLogs, null, 2);
      filename = `server-logs-${Date.now()}.json`;
      mimeType = 'application/json';
    } else if (format === 'csv') {
      const headers = 'ID,Level,Message,Data,Timestamp\n';
      const rows = filteredLogs.map(log => 
        `${log.id},"${log.level}","${log.message.replace(/"/g, '""')}","${log.data ? JSON.stringify(log.data).replace(/"/g, '""') : ''}","${log.created_at}"`
      ).join('\n');
      content = headers + rows;
      filename = `server-logs-${Date.now()}.csv`;
      mimeType = 'text/csv';
    } else {
      content = filteredLogs.map(log => {
        const timestamp = new Date(log.created_at).toLocaleString();
        const data = log.data ? `\n  Data: ${JSON.stringify(log.data, null, 2)}` : '';
        return `[${timestamp}] [${log.level.toUpperCase()}] ${log.message}${data}`;
      }).join('\n\n');
      filename = `server-logs-${Date.now()}.txt`;
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearOldLogs = async () => {
    try {
      const response = await window.api.serverLogs.clearOld(7);
      if (response.ok) {
        await window.api.notification.show({
          type: 'success',
          title: 'Logs Cleared',
          message: `Removed ${response.data?.deleted || 0} old logs`
        });
        loadLogs();
        loadStats();
      }
    } catch (err) {
      await window.api.notification.show({
        type: 'error',
        title: 'Clear Failed',
        message: err instanceof Error ? err.message : 'Failed to clear logs'
      });
    }
  };

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'error':
        return '#EF4444';
      case 'warn':
        return '#F59E0B';
      case 'info':
        return '#3B82F6';
      case 'debug':
        return '#6B7280';
      default:
        return '#D1D5DB';
    }
  };

  const getLevelBgColor = (level: string): string => {
    switch (level) {
      case 'error':
        return 'rgba(239, 68, 68, 0.1)';
      case 'warn':
        return 'rgba(245, 158, 11, 0.1)';
      case 'info':
        return 'rgba(59, 130, 246, 0.1)';
      case 'debug':
        return 'rgba(107, 114, 128, 0.1)';
      default:
        return 'rgba(209, 213, 219, 0.1)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            padding: '0.75rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
              Total
            </div>
          </div>
          {['error', 'warn', 'info', 'debug'].map((level) => (
            <div
              key={level}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '8px',
                padding: '0.75rem',
                textAlign: 'center'
              }}
            >
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: getLevelColor(level)
              }}>
                {stats.byLevel[level] || 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', textTransform: 'uppercase' }}>
                {level}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters & Controls */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: '8px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        flexShrink: 0
      }}>
        {/* Search */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍 Search logs..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid var(--card-border)',
              background: 'var(--bg)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem'
            }}
          />
        </div>

        {/* Level Filter Checkboxes */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Levels:</span>
          {['debug', 'info', 'warn', 'error'].map(level => (
            <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={levelFilters.has(level)}
                onChange={() => toggleLevelFilter(level)}
                style={{ cursor: 'pointer' }}
              />
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: getLevelColor(level),
                textTransform: 'uppercase'
              }}>
                {level}
              </span>
            </label>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={loadLogs} disabled={loading} style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '4px',
              border: '1px solid var(--card-border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              opacity: loading ? 0.6 : 1
            }}>
              {loading ? '⟳' : '↻'} Refresh
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '4px',
                  border: `1px solid ${autoRefreshEnabled ? '#10B981' : 'var(--card-border)'}`,
                  background: autoRefreshEnabled ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  color: autoRefreshEnabled ? '#10B981' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                {autoRefreshEnabled ? '⏸' : '▶'} Auto
              </button>
              <select
                value={selectedInterval}
                onChange={(e) => setSelectedInterval(Number(e.target.value))}
                disabled={!autoRefreshEnabled}
                style={{
                  padding: '0.4rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid var(--card-border)',
                  background: 'var(--bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.7rem',
                  cursor: autoRefreshEnabled ? 'pointer' : 'not-allowed',
                  opacity: autoRefreshEnabled ? 1 : 0.5
                }}
              >
                <option value={1000}>1s</option>
                <option value={2000}>2s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
                <option value={60000}>60s</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => exportLogs('json')} style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '4px',
              border: '1px solid #6200EE',
              background: 'transparent',
              color: '#6200EE',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 600
            }}>
              JSON
            </button>
            <button onClick={() => exportLogs('csv')} style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '4px',
              border: '1px solid #03DAC6',
              background: 'transparent',
              color: '#03DAC6',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 600
            }}>
              CSV
            </button>
            <button onClick={() => exportLogs('txt')} style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '4px',
              border: '1px solid #6B7280',
              background: 'transparent',
              color: '#6B7280',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 600
            }}>
              TXT
            </button>
            <button onClick={clearOldLogs} style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '4px',
              border: '1px solid #F59E0B',
              background: 'transparent',
              color: '#F59E0B',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 600
            }}>
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Result count */}
        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
          Showing {filteredLogs.length} of {logs.length} logs
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          padding: '0.75rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #EF4444',
          borderRadius: '6px',
          color: '#EF4444',
          fontSize: '0.875rem',
          flexShrink: 0
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Logs list - Takes remaining space */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: '8px',
        overflow: 'hidden',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredLogs.length === 0 ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: '0.875rem'
            }}>
              {loading ? 'Loading logs...' : searchText || levelFilters.size < 4 ? 'No logs match filters' : 'No logs found'}
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const isExpanded = expandedLogs.has(log.id);
              return (
                <div
                  key={log.id}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: index < filteredLogs.length - 1 ? '1px solid var(--card-border)' : 'none',
                    cursor: log.data ? 'pointer' : 'default',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => log.data && toggleLogExpansion(log.id)}
                  onMouseEnter={(e) => {
                    if (log.data) e.currentTarget.style.background = 'var(--bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    {/* Level badge */}
                    <div style={{
                      minWidth: '50px',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: getLevelBgColor(log.level),
                      color: getLevelColor(log.level),
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      textTransform: 'uppercase'
                    }}>
                      {log.level}
                    </div>

                    {/* Log content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        color: 'var(--text-primary)', 
                        fontSize: '0.8rem', 
                        marginBottom: '0.25rem',
                        wordBreak: 'break-word'
                      }}>
                        {log.message}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                        {new Date(log.created_at).toLocaleString()}
                        {log.data && <span style={{ marginLeft: '0.5rem' }}>{isExpanded ? '▼' : '▶'} Details</span>}
                      </div>
                      {isExpanded && log.data && (
                        <div style={{
                          background: 'var(--bg)',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontFamily: 'monospace',
                          color: 'var(--text-tertiary)',
                          overflow: 'auto',
                          maxHeight: '150px',
                          marginTop: '0.5rem',
                          wordBreak: 'break-all'
                        }}>
                          {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
