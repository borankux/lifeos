import React, { useState, useEffect } from 'react';

interface NotebookStats {
  totalNotebooks: number;
  totalNotes: number;
  totalWords: number;
  recentNotes: number;
}

export function NotebookStatsModule() {
  const [notebookStats, setNotebookStats] = useState<NotebookStats | null>(null);

  useEffect(() => {
    loadNotebookStats();
    const interval = setInterval(loadNotebookStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  async function loadNotebookStats() {
    try {
      const response = await window.api.notebook.getStats();
      if (response.ok && response.data) {
        setNotebookStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load notebook stats:', error);
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
        <span style={{ fontSize: '1.2rem' }}>📓</span>
        知识库统计
      </h3>
      
      {notebookStats ? (
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
              <span style={{ marginRight: '0.25rem' }}>📚</span>
              笔记本
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#03DAC6' }}>
              {notebookStats.totalNotebooks}
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
              <span style={{ marginRight: '0.25rem' }}>📝</span>
              笔记数
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#6200EE' }}>
              {notebookStats.totalNotes}
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
              <span style={{ marginRight: '0.25rem' }}>✍️</span>
              总字数
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FF9800' }}>
              {notebookStats.totalWords.toLocaleString()}
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
              <span style={{ marginRight: '0.25rem' }}>🆕</span>
              最近7天
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FF5252' }}>
              {notebookStats.recentNotes}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
          加载中...
        </div>
      )}
    </div>
  );
}
