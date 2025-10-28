import React, { useState, useEffect } from 'react';

interface CountdownCardProps {
  label: string;
  icon: string;
  remaining: number;
  percentage: number;
  color: string;
  unit: string;
}

function CountdownCard({ label, icon, remaining, percentage, color, unit }: CountdownCardProps) {
  const formatRemaining = (value: number, unitType: string): string => {
    if (unitType === 'hours') {
      const hours = Math.floor(value);
      return `${hours}h`;
    }
    return `${Math.floor(value)}d`;
  };

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.375rem',
      minWidth: '68px'
    }}>
      {/* Circular Progress */}
      <div style={{ position: 'relative', width: '60px', height: '60px' }}>
        <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="4"
          />
          {/* Progress circle */}
          <circle
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.5s ease',
              filter: `drop-shadow(0 0 4px ${color}40)`
            }}
          />
        </svg>
        {/* Center content */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.125rem'
        }}>
          {icon}
        </div>
      </div>
      
      {/* Label */}
      <div style={{
        fontSize: '0.65rem',
        color: 'var(--text-secondary)',
        textAlign: 'center',
        fontWeight: 600
      }}>
        {label}
      </div>
      
      {/* Remaining time */}
      <div style={{
        fontSize: '0.75rem',
        color,
        textAlign: 'center',
        fontWeight: 700,
        lineHeight: 1
      }}>
        {formatRemaining(remaining, unit)}
      </div>
    </div>
  );
}

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
    <>
      {countdowns.map((countdown, index) => (
        <CountdownCard
          key={index}
          label={countdown.label}
          icon={countdown.icon}
          remaining={countdown.remaining}
          percentage={countdown.percentage}
          color={countdown.color}
          unit={getUnit(countdown.label)}
        />
      ))}
    </>
  );
}
