import { CSSProperties, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ReactMarkdown from 'react-markdown';
import type { Task } from '../../common/types';

interface TaskCardProps {
  task: Task;
  onDoubleClick?: (task: Task) => void;
}

export function TaskCard({ task, onDoubleClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `task-${task.id}` });

  const style = useMemo<CSSProperties>(() => {
    // Only apply transform and tilt when actually dragging (transform exists)
    let transformString = transform ? CSS.Translate.toString(transform) : '';
    if (transform && transformString) {
      // Only add rotation when there's actual movement
      transformString = `${transformString} rotate(3deg)`;
    }

    return {
      transform: transformString,
      transition: transition,
      // Hide the original card when dragging to prevent "ghost" effect
      opacity: isDragging ? 0 : 1,
      visibility: isDragging ? 'hidden' : 'visible',
      background: 'var(--card-bg)',
      borderRadius: '12px',
      padding: '0.75rem 1rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      border: '2px solid var(--card-border)',
      cursor: 'grab',
      color: 'var(--text-primary)'
    };
  }, [transform, transition, isDragging]);

  return (
    <article 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick?.(task);
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <strong style={{ color: 'var(--text-primary)', userSelect: 'text', cursor: 'text', flex: 1 }}>{task.title}</strong>
        {task.priority && (
          <span style={{
            ...badgeStyle(getPriorityBgColor(task.priority), getPriorityColor(task.priority)),
            flexShrink: 0,
            fontSize: '0.65rem',
            padding: '0.25rem 0.5rem',
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}>
            {getPriorityLabel(task.priority)}
          </span>
        )}
      </div>
      {task.description ? (
        <div style={{ 
          marginTop: '0.5rem', 
          fontSize: '0.8rem', 
          color: 'var(--text-tertiary)', 
          opacity: 0.7,
          userSelect: 'text', 
          cursor: 'text',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: '1.4'
        }}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p style={{ margin: 0, display: 'inline' }}>{children}</p>,
              strong: ({ children }) => <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{children}</strong>,
              em: ({ children }) => <em style={{ color: 'var(--text-tertiary)' }}>{children}</em>,
              code: ({ children }) => (
                <code style={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  padding: '0.125rem 0.25rem', 
                  borderRadius: '3px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace'
                }}>{children}</code>
              ),
              ul: ({ children }) => <span style={{ display: 'inline' }}>{children}</span>,
              ol: ({ children }) => <span style={{ display: 'inline' }}>{children}</span>,
              li: ({ children }) => <span style={{ display: 'inline' }}>• {children} </span>,
            }}
          >
            {task.description}
          </ReactMarkdown>
        </div>
      ) : null}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', userSelect: 'none', WebkitUserSelect: 'none' }}>
        {task.dueDate ? (
          <span style={badgeStyle('rgba(3, 218, 198, 0.15)', '#03DAC6')}>{new Date(task.dueDate).toLocaleDateString()}</span>
        ) : null}
        {task.tags?.map((tag) => (
          <span key={tag} style={badgeStyle('rgba(255,255,255,0.08)', '#ddd')}>#{tag}</span>
        ))}
      </div>
    </article>
  );
}

function badgeStyle(background: string, color: string): CSSProperties {
  return {
    background,
    color,
    padding: '0.25rem 0.5rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 500
  };
}

function getPriorityLabel(priority: string): string {
  // Eisenhower Matrix - use full descriptive words
  const normalizedPriority = priority?.toLowerCase() || '';
  
  // Check in order from most specific to least specific
  if (normalizedPriority.includes('not urgent') && normalizedPriority.includes('not important')) {
    return 'Low';       // Not Urgent & Not Important - Low priority
  } else if (normalizedPriority.includes('urgent') && normalizedPriority.includes('important') && !normalizedPriority.includes('not')) {
    return 'Critical';  // Urgent & Important - Do First
  } else if (normalizedPriority.includes('urgent') && normalizedPriority.includes('not important')) {
    return 'Delegate';  // Urgent & Not Important - Delegate
  } else if (normalizedPriority.includes('not urgent') && normalizedPriority.includes('important')) {
    return 'Schedule';  // Not Urgent & Important - Plan/Schedule
  }
  
  // Fallback for old priority values
  return priority.substring(0, 8);
}

function getPriorityColor(priority: string): string {
  // Eisenhower Matrix colors - normalize input
  const normalizedPriority = priority?.toLowerCase() || '';
  
  // Check in order from most specific to least specific
  if (normalizedPriority.includes('not urgent') && normalizedPriority.includes('not important')) {
    return '#9E9E9E';  // Gray - Low priority
  } else if (normalizedPriority.includes('urgent') && normalizedPriority.includes('important') && !normalizedPriority.includes('not')) {
    return '#FF5252';  // Red - Critical
  } else if (normalizedPriority.includes('urgent') && normalizedPriority.includes('not important')) {
    return '#FF9800';  // Orange - Delegate
  } else if (normalizedPriority.includes('not urgent') && normalizedPriority.includes('important')) {
    return '#03DAC6';  // Teal - Schedule
  }
  
  // Fallback for old values
  return '#03DAC6';
}

function getPriorityBgColor(priority: string): string {
  // Eisenhower Matrix background colors - normalize input
  const normalizedPriority = priority?.toLowerCase() || '';
  
  // Check in order from most specific to least specific
  if (normalizedPriority.includes('not urgent') && normalizedPriority.includes('not important')) {
    return 'rgba(158, 158, 158, 0.15)';
  } else if (normalizedPriority.includes('urgent') && normalizedPriority.includes('important') && !normalizedPriority.includes('not')) {
    return 'rgba(255, 82, 82, 0.15)';
  } else if (normalizedPriority.includes('urgent') && normalizedPriority.includes('not important')) {
    return 'rgba(255, 152, 0, 0.15)';
  } else if (normalizedPriority.includes('not urgent') && normalizedPriority.includes('important')) {
    return 'rgba(3, 218, 198, 0.15)';
  }
  
  // Fallback for old values
  return 'rgba(3, 218, 198, 0.15)';
}
