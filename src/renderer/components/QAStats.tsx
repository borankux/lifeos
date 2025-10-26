import { useEffect, useState } from 'react';

interface QAStatsData {
  totalCollections: number;
  totalQuestions: number;
  unansweredQuestions: number;
  inProgressQuestions: number;
  answeredQuestions: number;
  totalAnswers: number;
}

export function QAStats() {
  const [stats, setStats] = useState<QAStatsData | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const response = await window.api.qa.getStats();
      if (response.ok && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load Q&A stats:', error);
    }
  }

  if (!stats) {
    return null;
  }

  const answerRate = stats.totalQuestions > 0
    ? Math.round((stats.answeredQuestions / stats.totalQuestions) * 100)
    : 0;

  return (
    <div style={{
      padding: '1.5rem',
      borderRadius: '12px',
      background: 'var(--card-bg)',
      border: '2px solid var(--card-border)'
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
        <span style={{ fontSize: '1.2rem' }}>💡</span>
        Q&A Knowledge Base
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div style={{
          padding: '0.75rem',
          borderRadius: '8px',
          background: 'rgba(3, 218, 198, 0.08)',
          border: '1px solid rgba(3, 218, 198, 0.2)'
        }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#03DAC6', lineHeight: 1 }}>
            {stats.totalQuestions}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Total Questions
          </div>
        </div>

        <div style={{
          padding: '0.75rem',
          borderRadius: '8px',
          background: 'rgba(98, 0, 238, 0.08)',
          border: '1px solid rgba(98, 0, 238, 0.2)'
        }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#6200EE', lineHeight: 1 }}>
            {answerRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Answer Rate
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{
          fontSize: '0.75rem',
          padding: '0.375rem 0.625rem',
          borderRadius: '12px',
          background: 'rgba(255, 82, 82, 0.15)',
          border: '1px solid rgba(255, 82, 82, 0.3)',
          color: '#FF5252',
          fontWeight: 600
        }}>
          {stats.unansweredQuestions} Unanswered
        </div>

        <div style={{
          fontSize: '0.75rem',
          padding: '0.375rem 0.625rem',
          borderRadius: '12px',
          background: 'rgba(255, 152, 0, 0.15)',
          border: '1px solid rgba(255, 152, 0, 0.3)',
          color: '#FF9800',
          fontWeight: 600
        }}>
          {stats.inProgressQuestions} In Progress
        </div>

        <div style={{
          fontSize: '0.75rem',
          padding: '0.375rem 0.625rem',
          borderRadius: '12px',
          background: 'rgba(3, 218, 198, 0.15)',
          border: '1px solid rgba(3, 218, 198, 0.3)',
          color: '#03DAC6',
          fontWeight: 600
        }}>
          {stats.answeredQuestions} Answered
        </div>
      </div>

      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.03)',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)'
      }}>
        📚 {stats.totalCollections} {stats.totalCollections === 1 ? 'collection' : 'collections'} • 
        💬 {stats.totalAnswers} {stats.totalAnswers === 1 ? 'answer' : 'answers'}
      </div>
    </div>
  );
}
