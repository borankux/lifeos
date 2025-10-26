import { useEffect, useState } from 'react';

interface MetricsData {
  A: number;
  E: number;
  aliveness?: any;
  efficiency?: any;
}

interface GaugeProps {
  value: number;
  label: string;
  color: string;
  subtitle?: string;
}

function Gauge({ value, label, color, subtitle }: GaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    // Animate value on mount
    const timeout = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timeout);
  }, [value]);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  // Determine status color based on value
  const getStatusColor = () => {
    if (value >= 70) return color;
    if (value >= 40) return '#FF9800';
    return '#FF5252';
  };

  const statusColor = getStatusColor();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1rem',
      borderRadius: '12px',
      background: 'var(--card-bg)',
      border: '2px solid var(--card-border)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow effect */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '120px',
        height: '120px',
        background: `radial-gradient(circle, ${statusColor}15 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />

      {/* SVG Gauge */}
      <svg width="110" height="110" style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}>
        {/* Background circle */}
        <circle
          cx="55"
          cy="55"
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="8"
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx="55"
          cy="55"
          r={radius}
          stroke={statusColor}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease',
            filter: `drop-shadow(0 0 6px ${statusColor}40)`
          }}
        />
      </svg>

      {/* Center value */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        marginTop: '-5px'
      }}>
        <div style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: statusColor,
          lineHeight: 1,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          {Math.round(animatedValue)}
        </div>
        <div style={{
          fontSize: '0.6rem',
          color: 'var(--text-tertiary)',
          marginTop: '0.125rem',
          fontWeight: 500
        }}>
          / 100
        </div>
      </div>

      {/* Label */}
      <div style={{
        marginTop: '0.75rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: 'var(--text-primary)'
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export function MetricsGauges() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
    // Refresh every 5 minutes
    const interval = setInterval(loadMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadMetrics() {
    try {
      const response = await window.api.metrics.current();
      if (response.ok && response.data) {
        setMetrics(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to load metrics');
      }
    } catch (err) {
      console.error('Error loading metrics:', err);
      setError('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem'
      }}>
        {[1, 2].map(i => (
          <div key={i} style={{
            height: '160px',
            borderRadius: '12px',
            background: 'var(--card-bg)',
            border: '2px solid var(--card-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              border: '3px solid rgba(3, 218, 198, 0.3)',
              borderTopColor: '#03DAC6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        ))}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        borderRadius: '16px',
        background: 'var(--card-bg)',
        border: '2px solid var(--card-border)'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
        <div style={{ color: 'var(--text-secondary)' }}>{error || 'No metrics available'}</div>
        <button
          onClick={loadMetrics}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            background: '#03DAC6',
            border: 'none',
            color: '#121212',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: '12px',
      background: 'var(--card-bg)',
      border: '2px solid var(--card-border)',
      padding: '1rem'
    }}>
      <h3 style={{ 
        margin: '0 0 1rem 0', 
        fontSize: '0.95rem', 
        fontWeight: 600, 
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{ fontSize: '1.2rem' }}>🎯</span>
        Life Metrics
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem'
      }}>
        <Gauge
          value={metrics.A}
          label="Aliveness"
          color="#03DAC6"
        />
        <Gauge
          value={metrics.E}
          label="Efficiency"
          color="#6200EE"
        />
      </div>
    </div>
  );
}
