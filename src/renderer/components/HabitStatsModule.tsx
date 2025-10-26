import React, { useState, useEffect } from 'react';

interface HabitStats {
  totalHabits: number;
  activeHabits: number;
  completedToday: number;
  avgCompletionRate: number;
}

export function HabitStatsModule() {
  const [habitStats, setHabitStats] = useState<HabitStats | null>(null);

  useEffect(() => {
    loadHabitStats();
    const interval = setInterval(loadHabitStats, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadHabitStats() {
    try {
      const response = await window.api.habits.getStats();
      if (response.ok && response.data) {
        setHabitStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load habit stats:', error);
    }
  }

  return (
    <div style={{
      borderRadius: '12px',
      background: 'var(--card-bg)',
      border: '2px solid var(--card-border)',
      padding: '1.5rem'
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
        <span style={{ fontSize: '1.2rem' }}>✓</span>
        Habit Tracker
      </h3>
      
      {habitStats ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{
            padding: '0.75rem',
            borderRadius: '8px',
            background: 'var(--hover-bg)',
            border: '1px solid var(--card-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <span style={{ marginRight: '0.25rem' }}>📋</span>
              Active Habits
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#03DAC6' }}>
              {habitStats.activeHabits}
            </div>
          </div>
          
          <div style={{
            padding: '0.75rem',
            borderRadius: '8px',
            background: 'var(--hover-bg)',
            border: '1px solid var(--card-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <span style={{ marginRight: '0.25rem' }}>✅</span>
              Completed Today
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#4CAF50' }}>
              {habitStats.completedToday}
            </div>
          </div>
          
          <div style={{
            padding: '0.75rem',
            borderRadius: '8px',
            background: 'var(--hover-bg)',
            border: '1px solid var(--card-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <span style={{ marginRight: '0.25rem' }}>📊</span>
              Avg Completion
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FF9800' }}>
              {habitStats.avgCompletionRate}%
            </div>
          </div>
          
          <div style={{
            padding: '0.75rem',
            borderRadius: '8px',
            background: 'var(--hover-bg)',
            border: '1px solid var(--card-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <span style={{ marginRight: '0.25rem' }}>🎯</span>
              Total Habits
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#6200EE' }}>
              {habitStats.totalHabits}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
          Loading...
        </div>
      )}
    </div>
  );
}
