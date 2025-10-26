import { useEffect, useState } from 'react';
import type { ActivityEntry } from '../../store/activity';

interface ActivityChartProps {
  activities: ActivityEntry[];
  daysToShow?: number;
}

interface DayData {
  date: string;
  count: number;
  label: string;
}

export function ActivityChart({ activities, daysToShow = 14 }: ActivityChartProps) {
  const [dayData, setDayData] = useState<DayData[]>([]);
  const [maxCount, setMaxCount] = useState(0);

  useEffect(() => {
    // Generate last N days
    const days: DayData[] = [];
    const today = new Date();
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Count activities for this day
      const count = activities.filter(a => {
        const activityDate = a.created_at.split('T')[0];
        return activityDate === dateStr;
      }).length;
      
      days.push({
        date: dateStr,
        count,
        label: i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    setDayData(days);
    setMaxCount(Math.max(...days.map(d => d.count), 1));
  }, [activities, daysToShow]);

  return (
    <div style={{
      padding: '1.5rem',
      borderRadius: '12px',
      background: 'var(--card-bg)',
      border: '2px solid var(--card-border)',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    }}>
      <h3 style={{ 
        margin: '0 0 1.5rem 0', 
        fontSize: '1rem', 
        fontWeight: 600, 
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{ fontSize: '1.2rem' }}>📈</span>
        Daily Activity
      </h3>

      {/* Chart Area */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '0.5rem',
        height: '120px',
        padding: '0.5rem 0',
        position: 'relative'
      }}>
        {/* Horizontal grid lines */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          zIndex: 0
        }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: '100%',
              height: '1px',
              background: 'rgba(255, 255, 255, 0.05)',
            }} />
          ))}
        </div>

        {/* Bars */}
        {dayData.map((day, index) => {
          const heightPercent = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
          const isToday = day.label === 'Today';
          
          return (
            <div
              key={day.date}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                position: 'relative',
                zIndex: 1
              }}
            >
              {/* Bar */}
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                position: 'relative'
              }}>
                <div
                  style={{
                    width: '100%',
                    height: `${Math.max(heightPercent, 3)}%`,
                    background: isToday 
                      ? 'linear-gradient(180deg, #03DAC6 0%, rgba(3, 218, 198, 0.4) 100%)'
                      : 'linear-gradient(180deg, rgba(98, 0, 238, 0.8) 0%, rgba(98, 0, 238, 0.3) 100%)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    boxShadow: day.count > 0 
                      ? isToday
                        ? '0 0 10px rgba(3, 218, 198, 0.3)'
                        : '0 0 8px rgba(98, 0, 238, 0.2)'
                      : 'none',
                  }}
                  title={`${day.label}: ${day.count} activities`}
                >
                  {/* Activity count label on top of bar */}
                  {day.count > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-1.25rem',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: isToday ? '#03DAC6' : 'rgba(98, 0, 238, 0.9)',
                      whiteSpace: 'nowrap'
                    }}>
                      {day.count}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginTop: '0.75rem'
      }}>
        {dayData.map((day, index) => {
          const isToday = day.label === 'Today';
          // Show label for every other day to avoid crowding, but always show Today
          const shouldShow = isToday || index % 2 === 0 || index === dayData.length - 1;
          
          return (
            <div
              key={day.date}
              style={{
                flex: 1,
                fontSize: '0.65rem',
                color: isToday ? '#03DAC6' : 'var(--text-tertiary)',
                textAlign: 'center',
                fontWeight: isToday ? 700 : 400,
                opacity: shouldShow ? 1 : 0.3
              }}
            >
              {shouldShow ? day.label : '·'}
            </div>
          );
        })}
      </div>

      {/* Summary info */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        borderRadius: '8px',
        background: 'rgba(98, 0, 238, 0.08)',
        border: '1px solid rgba(98, 0, 238, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Total activities:
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#03DAC6' }}>
            {dayData.reduce((sum, d) => sum + d.count, 0)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Avg/day:
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {(dayData.reduce((sum, d) => sum + d.count, 0) / daysToShow).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
