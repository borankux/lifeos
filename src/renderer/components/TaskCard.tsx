import { CSSProperties, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../common/types';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `task-${task.id}` });

  const style = useMemo<CSSProperties>(() => ({
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: 'rgba(0,0,0,0.35)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    boxShadow: isDragging ? '0 8px 20px rgba(0,0,0,0.45)' : '0 4px 12px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.08)',
    cursor: 'grab'
  }), [transform, transition, isDragging]);

  return (
    <article ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <strong>{task.title}</strong>
      {task.description ? (
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.75 }}>{task.description}</p>
      ) : null}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
        {task.dueDate ? (
          <span style={badgeStyle('rgba(3, 218, 198, 0.15)', '#03DAC6')}>{new Date(task.dueDate).toLocaleDateString()}</span>
        ) : null}
        {task.priority ? <span style={badgeStyle('rgba(98,0,238,0.15)', '#bbb')}>{task.priority}</span> : null}
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
