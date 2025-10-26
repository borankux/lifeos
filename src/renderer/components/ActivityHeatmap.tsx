import React, { useMemo } from 'react';

interface ActivityDay {
  date: string;
  count: number;
  types: { [key: string]: number };
}

interface ActivityHeatmapProps {
  activities: Array<{ created_at: string; type: string }>;
  weeksToShow?: number;
}

export function ActivityHeatmap({ activities, weeksToShow = 52 }: ActivityHeatmapProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const heatmapData = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (weeksToShow * 7));
    
    // Create a map of dates to activity counts
    const activityMap = new Map<string, ActivityDay>();
    
    // Initialize all days with zero counts
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      activityMap.set(dateStr, { date: dateStr, count: 0, types: {} });
    }
    
    // Count activities per day
    activities.forEach(activity => {
      // Handle both formats: full ISO timestamp or just date
      const dateStr = activity.created_at.includes('T') 
        ? activity.created_at.split('T')[0] 
        : activity.created_at.split(' ')[0];
      const day = activityMap.get(dateStr);
      if (day) {
        day.count++;
        day.types[activity.type] = (day.types[activity.type] || 0) + 1;
      }
    });
    
    return Array.from(activityMap.values());
  }, [activities, weeksToShow]);

  const getIntensityColor = (count: number): string => {
    // Check if we're in light mode by checking background color
    const isLightMode = document.body.style.background === 'rgb(245, 245, 245)' || 
                        document.body.style.background === '#f5f5f5';
    
    if (count === 0) {
      return isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.04)';
    }
    
    // Use darker, more visible colors for light mode
    if (isLightMode) {
      if (count <= 2) return 'rgba(3, 218, 198, 0.3)';
      if (count <= 5) return 'rgba(3, 218, 198, 0.5)';
      if (count <= 10) return 'rgba(3, 218, 198, 0.7)';
      return 'rgba(3, 218, 198, 0.95)';
    } else {
      if (count <= 2) return 'rgba(3, 218, 198, 0.2)';
      if (count <= 5) return 'rgba(3, 218, 198, 0.4)';
      if (count <= 10) return 'rgba(3, 218, 198, 0.6)';
      return 'rgba(3, 218, 198, 0.9)';
    }
  };

  const weeks = useMemo(() => {
    const result: ActivityDay[][] = [];
    let currentWeek: ActivityDay[] = [];
    
    heatmapData.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();
      
      // Start new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        result.push(currentWeek);
        currentWeek = [];
      }
      
      // Pad the first week with empty days if it doesn't start on Sunday
      if (index === 0 && dayOfWeek !== 0) {
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({ date: '', count: -1, types: {} });
        }
      }
      
      currentWeek.push(day);
      
      // Push the last week
      if (index === heatmapData.length - 1) {
        result.push(currentWeek);
      }
    });
    
    return result;
  }, [heatmapData]);

  const [hoveredDay, setHoveredDay] = React.useState<ActivityDay | null>(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  const handleMouseEnter = (day: ActivityDay, e: React.MouseEvent) => {
    if (day.count >= 0) {
      setHoveredDay(day);
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Auto-scroll to show current day at the right
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [weeks]);

  return (
    <div style={{ position: 'relative', padding: '1.25rem', userSelect: 'none', WebkitUserSelect: 'none' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>📊</span>
            Activity Calendar
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>({activities.length} total activities)</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          {weeksToShow} weeks • Scroll to view history
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', overflow: 'hidden' }}>
        {/* Day labels */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.25rem', 
          fontSize: '0.65rem', 
          color: 'var(--text-secondary)', 
          paddingTop: '1.5rem',
          minWidth: '32px'
        }}>
          {dayNames.map((day, i) => (
            <div key={day} style={{ 
              height: 12, 
              lineHeight: '12px', 
              visibility: i % 2 === 1 ? 'visible' : 'hidden',
              textAlign: 'right',
              paddingRight: '0.5rem'
            }}>
              {day}
            </div>
          ))}
        </div>
        
        {/* Heatmap grid */}
        <div ref={scrollContainerRef} style={{ 
          flex: 1, 
          overflow: 'auto',
          paddingBottom: '0.5rem'
        }}>
          <div style={{ display: 'flex', gap: '0.25rem', minWidth: 'fit-content' }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {/* Month label */}
                {weekIndex === 0 || new Date(week[0]?.date || '').getDate() <= 7 ? (
                  <div style={{ 
                    fontSize: '0.7rem', 
                    color: 'var(--text-secondary)', 
                    height: '1.25rem', 
                    marginBottom: '0.25rem',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}>
                    {week[0]?.date ? monthNames[new Date(week[0].date).getMonth()] : ''}
                  </div>
                ) : (
                  <div style={{ height: '1.25rem', marginBottom: '0.25rem' }} />
                )}
                
                {/* Days */}
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    onMouseEnter={(e) => handleMouseEnter(day, e)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      background: day.count < 0 ? 'transparent' : getIntensityColor(day.count),
                      cursor: day.count >= 0 ? 'pointer' : 'default',
                      transition: 'all 0.1s ease',
                      border: hoveredDay?.date === day.date && day.count >= 0 
                        ? '1px solid rgba(3, 218, 198, 0.8)' 
                        : day.count >= 0 ? '1px solid var(--card-border)' : '1px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.5rem',
                      fontWeight: 700,
                      color: day.count > 0 ? 'var(--text-primary)' : 'transparent'
                    }}
                  >
                    {day.count > 5 ? day.count : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && hoveredDay.count >= 0 && (
        <div
          style={{
            position: 'fixed',
            left: mousePos.x + 10,
            top: mousePos.y + 10,
            background: 'rgba(18, 18, 18, 0.98)',
            border: '1px solid rgba(3, 218, 198, 0.3)',
            borderRadius: 8,
            padding: '0.5rem 0.75rem',
            fontSize: '0.8rem',
            pointerEvents: 'none',
            zIndex: 10000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            minWidth: 150
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
            {new Date(hoveredDay.date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div style={{ color: hoveredDay.count === 0 ? 'rgba(255, 255, 255, 0.5)' : '#03DAC6' }}>
            {hoveredDay.count} {hoveredDay.count === 1 ? 'activity' : 'activities'}
          </div>
          {hoveredDay.count > 0 && Object.keys(hoveredDay.types).length > 0 && (
            <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', opacity: 0.7 }}>
              {Object.entries(hoveredDay.types).map(([type, count]) => (
                <div key={type}>
                  {type}: {count}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ActivityHeatmap;
