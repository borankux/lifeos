import React, { useEffect, useState } from 'react';
import type { Task } from '../../common/types';
import { KanbanColumn } from '../components/KanbanColumn';
import type { KanbanStatus } from '../constants';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { TaskCard } from '../components/TaskCard';

interface KanbanPageProps {
  activeProjectId?: number | null;
}

export default function KanbanPage({ activeProjectId }: KanbanPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProjectId) {
      setTasks([]);
      return;
    }

    async function loadTasks() {
      try {
  const res = await window.api.tasks.listByProject(activeProjectId!);
        if (res.ok && res.data) {
          setTasks(res.data);
        } else {
          console.error('Failed to load tasks:', res.error);
          setTasks([]);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
        setTasks([]);
      }
    }

    void loadTasks();
  }, [activeProjectId]);

  async function handleCreateTask(title: string, status: KanbanStatus) {
    if (!activeProjectId) return;

    try {
      const res = await window.api.tasks.create({ title, status, projectId: activeProjectId });
      if (res.ok) {
        const listRes = await window.api.tasks.listByProject(activeProjectId);
        if (listRes.ok && listRes.data) setTasks(listRes.data);
      } else {
        console.error('Failed to create task:', res.error);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }

  const sensors = useSensors(useSensor(PointerSensor));

  function findTaskBySortableId(id?: string) {
    if (!id) return undefined;
    if (!id.startsWith('task-')) return undefined;
    const tid = Number(id.replace('task-', ''));
    return tasks.find((t) => t.id === tid);
  }

  async function handleDragEnd(event: any) {
    const { active, over } = event;
    setActiveId(null);
    if (!active || !over) return;
    const activeTask = findTaskBySortableId(active.id);
    if (!activeTask || !activeProjectId) return;

    let destStatus: string | undefined;
    let destPosition = 1;

    if (typeof over.id === 'string' && over.id.startsWith('task-')) {
      const targetTask = findTaskBySortableId(over.id);
      if (targetTask) {
        destStatus = targetTask.status;
        destPosition = targetTask.position;
      }
    } else if (typeof over.id === 'string') {
      destStatus = over.id as KanbanStatus;
      const columnTasks = tasks.filter((t) => t.status === destStatus);
      destPosition = columnTasks.length + 1;
    }

    if (!destStatus) return;
    if (activeTask.status === destStatus && activeTask.position === destPosition) return;

    try {
      await window.api.tasks.move({ id: activeTask.id, projectId: activeProjectId, status: destStatus, position: destPosition });
      const res = await window.api.tasks.listByProject(activeProjectId);
      if (res.ok && res.data) setTasks(res.data);
    } catch (e) {
      console.error('Move failed', e);
    }
  }

  return (
    <div>
      <h2>Kanban</h2>
  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={(e) => setActiveId(String(e.active?.id ?? null))}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
          {(['To-Do', 'In Progress', 'Completed'] as KanbanStatus[]).map((status) => (
            <KanbanColumn key={status} status={status} tasks={tasks.filter((t) => t.status === status)} onCreateTask={handleCreateTask} />
          ))}
        </div>
        <DragOverlay dropAnimation={{ duration: 150 }}>
          {activeId ? (() => {
            const t = findTaskBySortableId(activeId);
            return t ? <TaskCard task={t} /> : null;
          })() : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
