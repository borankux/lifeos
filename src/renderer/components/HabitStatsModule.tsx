import { useEffect, useState } from 'react';

export function HabitStatsModule() {
  const [stats, setStats] = useState({
    totalHabits: 0,
    activeHabits: 0,
    completedToday: 0,
    avgCompletionRate: 0,
    bestStreak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // Load habit stats
        const statsRes = await window.api.habits.getStats();
        if (statsRes.ok && statsRes.data) {
          setStats({
            totalHabits: statsRes.data.totalHabits,
            activeHabits: statsRes.data.activeHabits,
            completedToday: statsRes.data.completedToday,
            avgCompletionRate: statsRes.data.avgCompletionRate,
            bestStreak: 0
          });
        }

        // Load habits to get best streak
        const habitsRes = await window.api.habits.list();
        if (habitsRes.ok && habitsRes.data) {
          const bestStreak = Math.max(...habitsRes.data.map((h: any) => h.currentStreak || 0), 0);
          setStats(prev => ({ ...prev, bestStreak }));
        }
      } catch (error) {
        console.error('Failed to load habit stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div style={{
        padding: '1.5rem',
        borderRadius: '12px',
        background: 'var(--card-bg)',
        border: '2px solid var(--card-border)',
        height: '100%'
      }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading habits...</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '1.5rem',
      borderRadius: '12px',
      background: 'var(--card-bg)',
      border: '2px solid var(--card-border)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem'
      }}>
        <span style={{ fontSize: '1.5rem' }}>⚡</span>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Habit Streaks
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
        {/* Total Habits */}
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          background: 'rgba(98, 0, 238, 0.1)',
          border: '1px solid rgba(98, 0, 238, 0.3)'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Total Habits
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6200EE' }}>
            {stats.activeHabits}
          </div>
        </div>

        {/* Completed Today */}
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          background: 'rgba(3, 218, 198, 0.1)',
          border: '1px solid rgba(3, 218, 198, 0.3)'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Done Today
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#03DAC6' }}>
            {stats.completedToday}
          </div>
        </div>

        {/* Best Streak */}
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          background: 'rgba(255, 152, 0, 0.1)',
          border: '1px solid rgba(255, 152, 0, 0.3)'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Best Streak
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FF9800', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            🔥 {stats.bestStreak}
          </div>
        </div>

        {/* Completion Rate */}
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          background: 'rgba(76, 175, 80, 0.1)',
          border: '1px solid rgba(76, 175, 80, 0.3)'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            30d Rate
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4CAF50' }}>
            {stats.avgCompletionRate}%
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      {stats.activeHabits > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Today's Progress</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {stats.completedToday}/{stats.activeHabits}
            </span>
          </div>
          <div style={{
            height: '8px',
            borderRadius: '999px',
            background: 'var(--hover-bg)',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${Math.round((stats.completedToday / stats.activeHabits) * 100)}%`,
              background: 'linear-gradient(90deg, #03DAC6 0%, #6200EE 100%)',
              borderRadius: '999px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
