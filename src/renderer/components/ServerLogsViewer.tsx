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

export function ServerLogsViewer({ autoRefresh = true, refreshInterval = 2000 }: Props) {
  const [logs, setLogs] = useState<ServerLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefresh);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const options: any = { limit: 100 };
      if (filter && filter !== 'all') {
        options.level = filter;
      }
      const response = await window.api.serverLogs.get(options);
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

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [filter]);

  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      loadLogs();
      loadStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, refreshInterval]);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
              Total Logs
            </div>
          </div>
          {['error', 'warn', 'info', 'debug'].map((level) => (
            <div
              key={level}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: getLevelColor(level)
                }}
              >
                {stats.byLevel[level] || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', textTransform: 'uppercase' }}>
                {level}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Filter:
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid var(--card-border)',
              background: 'var(--bg)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            <option value="">All Levels</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={loadLogs}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid var(--card-border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = 'var(--bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {loading ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>

          <button
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: `1px solid ${autoRefreshEnabled ? '#10B981' : 'var(--card-border)'}`,
              background: autoRefreshEnabled ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              color: autoRefreshEnabled ? '#10B981' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!autoRefreshEnabled) e.currentTarget.style.background = 'var(--bg)';
            }}
            onMouseLeave={(e) => {
              if (!autoRefreshEnabled) e.currentTarget.style.background = 'transparent';
            }}
          >
            {autoRefreshEnabled ? '⏸ Auto-refresh ON' : '▶ Auto-refresh OFF'}
          </button>

          <button
            onClick={clearOldLogs}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #F59E0B',
              background: 'transparent',
              color: '#F59E0B',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            🗑️ Clear Old
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            color: '#EF4444',
            fontSize: '0.875rem'
          }}
        >
          {error}
        </div>
      )}

      {/* Logs list */}
      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          overflow: 'hidden',
          maxHeight: '500px',
          overflowY: 'auto'
        }}
      >
        {logs.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: '0.875rem'
            }}
          >
            {loading ? 'Loading logs...' : 'No logs found'}
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={log.id}
              style={{
                padding: '1rem',
                borderBottom: index < logs.length - 1 ? '1px solid var(--card-border)' : 'none',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start'
              }}
            >
              {/* Level badge */}
              <div
                style={{
                  minWidth: '60px',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  background: getLevelBgColor(log.level),
                  color: getLevelColor(log.level),
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  textTransform: 'uppercase'
                }}
              >
                {log.level}
              </div>

              {/* Log content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  {log.message}
                </div>
                {log.data && (
                  <div
                    style={{
                      background: 'var(--bg)',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      color: 'var(--text-tertiary)',
                      overflow: 'auto',
                      maxHeight: '100px',
                      wordBreak: 'break-all'
                    }}
                  >
                    {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
