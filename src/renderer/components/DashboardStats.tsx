import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatsCard({ title, value, icon, color, subtitle, trend }: StatsCardProps) {
  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '2px solid var(--card-border)',
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--hover-bg)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--card-bg)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{title}</span>
        <div
          style={{
            fontSize: '1.5rem',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '12px',
            background: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <div style={{ zIndex: 1 }}>
        <div
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            lineHeight: 1,
            background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent', // Fallback for non-webkit browsers
          }}
        >
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{subtitle}</div>
        )}
      </div>

      {/* Trend indicator */}
      {trend && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: trend.isPositive ? '#00E676' : '#FF5252',
            zIndex: 1,
          }}
        >
          <span>{trend.isPositive ? '↗' : '↘'}</span>
          <span>{Math.abs(trend.value)}%</span>
          <span style={{ opacity: 0.7, fontWeight: 400 }}>vs last week</span>
        </div>
      )}
    </div>
  );
}

interface DashboardStatsProps {
  completionRate: number;
  todayCompletionRate: number;
  weeklyProductivity: number;
  averageTasksPerDay: number;
  totalTasks: number;
  backlogTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

export function DashboardStats({
  completionRate,
  todayCompletionRate,
  weeklyProductivity,
  averageTasksPerDay,
  totalTasks,
  backlogTasks,
  inProgressTasks,
  completedTasks,
}: DashboardStatsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem',
      }}
    >
      {/* Total Tasks */}
      <StatsCard
        title="Total Tasks"
        value={totalTasks}
        icon="📋"
        color="#03DAC6"
        subtitle={backlogTasks > 0 ? `+${backlogTasks} in backlog` : "All active tasks"}
      />

      {/* Total Completed */}
      <StatsCard
        title="Completed"
        value={completedTasks}
        icon="✅"
        color="#00E676"
        subtitle="Finished tasks"
      />

      {/* Completion Rate */}
      <StatsCard
        title="Completion Rate"
        value={`${completionRate}%`}
        icon="📊"
        color="#6200EE"
        subtitle="Overall progress"
        trend={{ value: 5, isPositive: true }}
      />

      {/* Activity Log */}
      <StatsCard
        title="Weekly Activity"
        value={weeklyProductivity}
        icon="🔥"
        color="#FF9800"
        subtitle="Actions per day"
        trend={{ value: 8, isPositive: true }}
      />
    </div>
  );
}

export default DashboardStats;
