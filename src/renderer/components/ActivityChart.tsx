import { useEffect, useState } from 'react';
import type { ActivityEntry } from '../../store/activity';

interface ActivityChartProps {
  activities: ActivityEntry[];
  daysToShow?: number;
}

interface DayData {
  date: string;
  tasks: number;
  notes: number;
  questions: number;
  answers: number;
  habits: number;
  total: number;
  label: string;
}

export function ActivityChart({ activities, daysToShow = 14 }: ActivityChartProps) {
  const [dayData, setDayData] = useState<DayData[]>([]);
  const [maxCount, setMaxCount] = useState(0);
  const [selectedLines, setSelectedLines] = useState({
    tasks: true,
    notes: true,
    questions: true,
    answers: true,
    habits: true
  });

  useEffect(() => {
    // Generate last N days
    const days: DayData[] = [];
    const today = new Date();
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Count activities by type for this day
      const dayActivities = activities.filter(a => {
        const activityDate = a.created_at.split('T')[0];
        return activityDate === dateStr;
      });
      
      const tasks = dayActivities.filter(a => a.type === 'task').length;
      const notes = dayActivities.filter(a => a.type === 'note' || a.type === 'diary').length;
      const questions = dayActivities.filter(a => a.type === 'question').length;
      const answers = dayActivities.filter(a => a.type === 'answer').length;
      const habits = dayActivities.filter(a => a.type === 'habit').length;
      
      days.push({
        date: dateStr,
        tasks,
        notes,
        questions,
        answers,
        habits,
        total: dayActivities.length,
        label: i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    setDayData(days);
    setMaxCount(Math.max(...days.map(d => d.total), 1));
  }, [activities, daysToShow]);

  const lineColors = {
    tasks: '#03DAC6',
    notes: '#9333ea',
    questions: '#FF9800',
    answers: '#00E676',
    habits: '#6200EE'
  };

  const lineLabels = {
    tasks: 'Tasks',
    notes: 'Notes',
    questions: 'Questions',
    answers: 'Answers',
    habits: 'Habits'
  };

  const toggleLine = (key: keyof typeof selectedLines) => {
    setSelectedLines(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{
      padding: '1.5rem',
      borderRadius: '12px',
      background: 'var(--card-bg)',
      border: '2px solid var(--card-border)',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      height: '400px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ 
        margin: '0 0 1rem 0', 
        fontSize: '1rem', 
        fontWeight: 600, 
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{ fontSize: '1.2rem' }}>📈</span>
        Daily Activity by Type
      </h3>

      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }}>
        {(Object.keys(lineLabels) as Array<keyof typeof lineLabels>).map(key => (
          <button
            key={key}
            onClick={() => toggleLine(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '6px',
              border: 'none',
              background: selectedLines[key] ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: selectedLines[key] ? lineColors[key] : 'var(--text-tertiary)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              opacity: selectedLines[key] ? 1 : 0.5
            }}
          >
            <div style={{ 
              width: '12px', 
              height: '2px', 
              background: lineColors[key],
              opacity: selectedLines[key] ? 1 : 0.3
            }} />
            {lineLabels[key]}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div style={{
        position: 'relative',
        flex: 1,
        minHeight: 0
      }}>
        <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={`grid-${i}`}
              x1="0"
              y1={`${i * 25}%`}
              x2="100%"
              y2={`${i * 25}%`}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1"
            />
          ))}

          {/* Lines for each activity type */}
          {(Object.keys(selectedLines) as Array<keyof typeof selectedLines>).map(type => {
            if (!selectedLines[type]) return null;
            
            const points = dayData.map((day, index) => {
              const x = (index / (dayData.length - 1)) * 100;
              const value = day[type];
              const y = 100 - ((value / maxCount) * 100);
              return `${x},${y}`;
            }).join(' ');

            return (
              <polyline
                key={type}
                points={points}
                fill="none"
                stroke={lineColors[type]}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }}
              />
            );
          })}

          {/* Data points */}
          {dayData.map((day, index) => {
            const x = (index / (dayData.length - 1)) * 100;
            
            return (
              <g key={day.date}>
                {(Object.keys(selectedLines) as Array<keyof typeof selectedLines>).map(type => {
                  if (!selectedLines[type] || day[type] === 0) return null;
                  
                  const value = day[type];
                  const y = 100 - ((value / maxCount) * 100);
                  
                  return (
                    <circle
                      key={`${day.date}-${type}`}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="3"
                      fill={lineColors[type]}
                      stroke="var(--card-bg)"
                      strokeWidth="2"
                    >
                      <title>{`${day.label} - ${lineLabels[type]}: ${value}`}</title>
                    </circle>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* X-axis labels */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginTop: '0.75rem'
      }}>
        {dayData.map((day, index) => {
          const isToday = day.label === 'Today';
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
            {dayData.reduce((sum, d) => sum + d.total, 0)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Avg/day:
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {(dayData.reduce((sum, d) => sum + d.total, 0) / daysToShow).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
