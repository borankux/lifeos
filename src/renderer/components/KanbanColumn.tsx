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
}

export function KanbanColumn({ status, tasks, onCreateTask }: KanbanColumnProps) {
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
        background: isOver ? 'rgba(98,0,238,0.25)' : 'rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '1rem',
        minHeight: '360px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        border: '1px solid rgba(255,255,255,0.12)'
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1rem' }}>{status}</h2>
        <span style={{ opacity: 0.7, fontSize: '0.85rem' }}>{tasks.length}</span>
      </header>
      <SortableContext items={tasks.map((task) => `task-${task.id}`)} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          placeholder={`Add task to ${status}`}
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(0,0,0,0.2)',
            color: '#fff'
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
    </div>
  );
}
