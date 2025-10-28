import React, { useEffect, useState } from 'react';

interface SummaryData {
  title: string;
  date: string;
  sections: {
    icon: string;
    heading: string;
    content: string;
  }[];
}

export function DailySummary() {
  const [summary, setSummary] = useState<SummaryData | null>(null);

  useEffect(() => {
    // Generate random summary for now
    // Later this will be replaced with LLM-generated content
    generateRandomSummary();
  }, []);

  const generateRandomSummary = () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const summaries = [
      {
        icon: '📝',
        heading: 'Today\'s Notes',
        content: 'You\'ve captured 3 new ideas in your notebook. Your thoughts on productivity systems are particularly insightful and could be expanded into a comprehensive guide.'
      },
      {
        icon: '✅',
        heading: 'Task Progress',
        content: 'Strong momentum today with 5 tasks completed. The project refactoring work is progressing well, and you\'re on track to meet your weekly goals.'
      },
      {
        icon: '💡',
        heading: 'Knowledge Growth',
        content: 'You\'ve explored 4 new questions this week. Your curiosity about system architecture patterns is driving deep learning in distributed systems.'
      },
      {
        icon: '🎯',
        heading: 'Habit Streaks',
        content: 'Maintaining consistency across your daily habits. Your meditation practice has reached a 7-day streak, contributing to improved focus throughout the day.'
      },
      {
        icon: '📚',
        heading: 'Recent Insights',
        content: 'Your notes reveal a pattern of interest in design systems and user experience. Consider consolidating these ideas into a unified framework.'
      }
    ];

    // Randomly select 2-3 sections
    const numSections = Math.floor(Math.random() * 2) + 2; // 2 or 3
    const shuffled = [...summaries].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numSections);

    setSummary({
      title: 'Daily Digest',
      date: dateStr,
      sections: selected
    });
  };

  if (!summary) {
    return (
      <>
        <div style={{
          borderRadius: '12px',
          background: 'var(--card-bg)',
          border: '2px solid var(--card-border)',
          padding: '1.5rem',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            border: '3px solid rgba(3, 218, 198, 0.3)',
            borderTopColor: '#03DAC6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  return (
    <div style={{
      borderRadius: '12px',
      background: 'linear-gradient(135deg, rgba(98, 0, 238, 0.05) 0%, rgba(3, 218, 198, 0.05) 100%)',
      border: '2px solid var(--card-border)',
      padding: '1.5rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '100px',
        height: '100px',
        background: 'radial-gradient(circle, rgba(98, 0, 238, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      
      {/* Header */}
      <div style={{ 
        marginBottom: '1rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.25rem'
        }}>
          <span style={{ fontSize: '1.25rem' }}>📰</span>
          <h3 style={{ 
            margin: 0, 
            fontSize: '1.1rem', 
            fontWeight: 700, 
            color: 'var(--text-primary)',
            background: 'linear-gradient(135deg, #03DAC6 0%, #6200EE 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {summary.title}
          </h3>
        </div>
        <div style={{ 
          fontSize: '0.7rem', 
          color: 'var(--text-tertiary)',
          fontWeight: 500
        }}>
          {summary.date}
        </div>
      </div>

      {/* Content sections */}
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        paddingRight: '0.5rem',
        position: 'relative',
        zIndex: 1
      }}>
        {summary.sections.map((section, index) => (
          <div 
            key={index}
            style={{
              padding: '0.875rem',
              borderRadius: '10px',
              background: 'var(--hover-bg)',
              border: '1px solid var(--card-border)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(98, 0, 238, 0.08)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--hover-bg)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '1rem' }}>{section.icon}</span>
              <h4 style={{
                margin: 0,
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--text-primary)'
              }}>
                {section.heading}
              </h4>
            </div>
            <p style={{
              margin: 0,
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}>
              {section.content}
            </p>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div style={{
        marginTop: '1rem',
        padding: '0.5rem',
        borderRadius: '6px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px dashed rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          fontSize: '0.65rem',
          color: 'var(--text-tertiary)',
          fontStyle: 'italic'
        }}>
          🤖 AI-powered insights coming soon
        </div>
      </div>
    </div>
  );
}
