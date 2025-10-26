import React, { useState, useEffect } from 'react';

interface CountdownInfo {
  label: string;
  icon: string;
  total: number;
  remaining: number;
  percentage: number;
  color: string;
}

interface NotebookStats {
  totalNotebooks: number;
  totalNotes: number;
  totalWords: number;
  recentNotes: number;
}

export function CountdownModule() {
  const [countdowns, setCountdowns] = useState<CountdownInfo[]>([]);

  useEffect(() => {
    updateCountdowns();
    const interval = setInterval(updateCountdowns, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const updateCountdowns = () => {
    const now = new Date();
    
    // Year countdown
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
    const yearTotal = Math.floor((yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
    const yearPassed = Math.floor((now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
    const yearRemaining = yearTotal - yearPassed;

    // Month countdown
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthTotal = Math.floor((monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));
    const monthPassed = Math.floor((now.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));
    const monthRemaining = monthTotal - monthPassed;

    // Week countdown (assuming week starts on Sunday)
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const weekTotal = 7;
    const weekPassed = dayOfWeek;
    const weekRemaining = weekTotal - weekPassed;

    // Day countdown
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);
    const dayTotal = 24; // hours
    const dayPassed = now.getHours() + now.getMinutes() / 60;
    const dayRemaining = dayTotal - dayPassed;

    setCountdowns([
      {
        label: '今年',
        icon: '📅',
        total: yearTotal,
        remaining: yearRemaining,
        percentage: (yearPassed / yearTotal) * 100,
        color: '#FF5252'
      },
      {
        label: '本月',
        icon: '🗓️',
        total: monthTotal,
        remaining: monthRemaining,
        percentage: (monthPassed / monthTotal) * 100,
        color: '#FF9800'
      },
      {
        label: '本周',
        icon: '📆',
        total: weekTotal,
        remaining: weekRemaining,
        percentage: (weekPassed / weekTotal) * 100,
        color: '#03DAC6'
      },
      {
        label: '今天',
        icon: '⏰',
        total: dayTotal,
        remaining: dayRemaining,
        percentage: (dayPassed / dayTotal) * 100,
        color: '#9333ea'
      }
    ]);
  };

  const formatRemaining = (remaining: number, unit: string): string => {
    if (unit === 'hours') {
      const hours = Math.floor(remaining);
      const minutes = Math.floor((remaining % 1) * 60);
      return `${hours}h ${minutes}m`;
    }
    return `${Math.floor(remaining)} ${unit}`;
  };

  const getUnit = (label: string): string => {
    if (label === '今天') return 'hours';
    if (label === '本周') return 'days';
    if (label === '本月') return 'days';
    return 'days';
  };

  return (
    <div style={{
      borderRadius: '12px',
      background: 'var(--card-bg)',
      border: '2px solid var(--card-border)',
      padding: '1rem',
      height: 'fit-content'
    }}>
      <h3 style={{ 
        margin: '0 0 0.75rem 0', 
        fontSize: '0.875rem', 
        fontWeight: 600, 
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        ⏳ 时间倒计时
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {countdowns.map((countdown, index) => (
          <div
            key={index}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              background: 'var(--hover-bg)',
              border: '1px solid var(--card-border)',
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '0.25rem'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.375rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}>
                <span style={{ fontSize: '0.875rem' }}>{countdown.icon}</span>
                <span>{countdown.label}</span>
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700,
                color: countdown.color
              }}>
                剩 {formatRemaining(countdown.remaining, getUnit(countdown.label))}
              </div>
            </div>
            
            {/* Progress bar */}
            <div style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '2px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div
                style={{
                  width: `${countdown.percentage}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${countdown.color}dd, ${countdown.color})`,
                  borderRadius: '2px',
                  transition: 'width 0.5s ease',
                  boxShadow: `0 0 6px ${countdown.color}40`
                }}
              />
            </div>
            
            <div style={{
              marginTop: '0.125rem',
              fontSize: '0.65rem',
              color: 'var(--text-tertiary)',
              textAlign: 'right'
            }}>
              已过 {countdown.percentage.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
