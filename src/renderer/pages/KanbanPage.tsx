import React, { useEffect, useState } from 'react';
import type { Task } from '../../common/types';
import { KanbanColumn } from '../components/KanbanColumn';
import type { KanbanStatus } from '../constants';

interface KanbanPageProps {
  activeProjectId?: number | null;
}

export default function KanbanPage({ activeProjectId }: KanbanPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!activeProjectId) return;
    window.api.tasks.listByProject(activeProjectId).then((res: any) => {
      if (res.ok && res.data) setTasks(res.data);
    });
  }, [activeProjectId]);

  async function handleCreateTask(title: string, status: KanbanStatus) {
    if (!activeProjectId) return;
    await window.api.tasks.create({ title, status, projectId: activeProjectId });
    const res = await window.api.tasks.listByProject(activeProjectId);
    if (res.ok && res.data) setTasks(res.data);
  }

  return (
    <div>
      <h2>Kanban</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
        {(['To-Do', 'In Progress', 'Completed'] as KanbanStatus[]).map((status) => (
          <KanbanColumn key={status} status={status} tasks={tasks.filter(t => t.status === status)} onCreateTask={handleCreateTask} />
        ))}
      </div>
    </div>
  );
}
