import { useState, type FormEvent } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task } from '../../common/types';
import type { KanbanStatus } from '../constants';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  status: KanbanStatus;
  tasks: Task[];
  onCreateTask: (title: string, status: KanbanStatus) => Promise<void>;
  onTaskDoubleClick?: (task: Task) => void;
}

export function KanbanColumn({ status, tasks, onCreateTask, onTaskDoubleClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const [draftTitle, setDraftTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draftTitle.trim()) {
      return;
    }
    try {
      setSubmitting(true);
      await onCreateTask(draftTitle, status);
      setDraftTitle('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        background: isOver ? 'rgba(98,0,238,0.15)' : 'var(--card-bg)',
        borderRadius: '16px',
        padding: '1rem',
        minHeight: '360px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        border: '2px solid var(--card-border)'
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{status}</h2>
        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{tasks.length}</span>
      </header>
      <SortableContext items={tasks.map((task) => `task-${task.id}`)} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDoubleClick={onTaskDoubleClick} />
          ))}
        </div>
      </SortableContext>
      
      {/* Only show task creation form in To-Do (backlog) column */}
      {status === 'To-Do' && (
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            placeholder="Add task to backlog"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--card-bg)',
              color: 'var(--text-primary)'
            }}
          />
          <button
            type="submit"
            disabled={submitting || !draftTitle.trim()}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              border: 'none',
              background: submitting ? 'rgba(255,255,255,0.1)' : '#6200EE',
              color: '#fff',
              cursor: submitting || !draftTitle.trim() ? 'not-allowed' : 'pointer',
              fontWeight: 600
            }}
          >
            Add
          </button>
        </form>
      )}
    </div>
  );
}
