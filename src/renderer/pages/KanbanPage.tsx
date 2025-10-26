import React, { useEffect, useState } from 'react';
import type { Task } from '../../common/types';
import { KanbanColumn } from '../components/KanbanColumn';
import type { KanbanStatus } from '../constants';
import { DndContext, DragOverlay, closestCenter, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { TaskCard } from '../components/TaskCard';
import { TaskDetailPanel } from '../components/TaskDetailPanel';
import useActivityStore from '../../store/activity';
import { useThemeStore } from '../../store/theme';

interface KanbanPageProps {
  activeProjectId?: number | null;
}

export default function KanbanPage({ activeProjectId }: KanbanPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [hideOldCompleted, setHideOldCompleted] = useState(false);

  // Load settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await window.api.settings.get();
        if (response.ok && response.data) {
          setHideOldCompleted(response.data.hideOldCompletedTasks || false);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
    loadSettings();
  }, []);

  // Filter tasks based on settings
  const filteredTasks = React.useMemo(() => {
    if (!hideOldCompleted) return tasks;
    
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => {
      if (task.status !== 'Completed') return true;
      // Show completed tasks from today
      return task.updatedAt?.startsWith(today);
    });
  }, [tasks, hideOldCompleted]);

  const toggleHideOldCompleted = async () => {
    const newValue = !hideOldCompleted;
    setHideOldCompleted(newValue);
    try {
      await window.api.settings.update({ hideOldCompletedTasks: newValue });
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const handleTaskDoubleClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleUpdateTask = async (id: number, updates: Partial<Task>) => {
    if (!activeProjectId) return;
    try {
      await window.api.tasks.update(id, updates as any);
      const res = await window.api.tasks.listByProject(activeProjectId);
      if (res.ok && res.data) setTasks(res.data);
      useActivityStore.getState().pushActivity('task', `Updated task`);
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!activeProjectId) return;
    try {
      const task = tasks.find(t => t.id === id);
      if (task) {
        await window.api.tasks.update(id, { status: 'Deleted' } as any);
        const res = await window.api.tasks.listByProject(activeProjectId);
        if (res.ok && res.data) setTasks(res.data.filter(t => t.status !== 'Deleted'));
        useActivityStore.getState().pushActivity('task', `Deleted task: ${task.title}`);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

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
        // push activity entry
        useActivityStore.getState().pushActivity('task', `Created task "${title}"`);
      } else {
        console.error('Failed to create task:', res.error);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Only start dragging after 8px movement to prevent accidental drags
      },
    })
  );

  function findTaskBySortableId(id?: string) {
    if (!id) return undefined;
    if (!id.startsWith('task-')) return undefined;
    const tid = Number(id.replace('task-', ''));
    return tasks.find((t) => t.id === tid);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    
    if (!active || !over || !activeProjectId) return;
    
    const activeTask = findTaskBySortableId(active.id as string);
    if (!activeTask) return;

    let destStatus: string;
    let destPosition: number;

    // Check if dropped over another task
    if (typeof over.id === 'string' && over.id.startsWith('task-')) {
      const overTask = findTaskBySortableId(over.id);
      if (!overTask) return;
      
      destStatus = overTask.status;
      
      // If same column, reorder within column
      if (activeTask.status === overTask.status) {
        const columnTasks = tasks
          .filter((t) => t.status === destStatus)
          .sort((a, b) => a.position - b.position);
        
        const oldIndex = columnTasks.findIndex((t) => t.id === activeTask.id);
        const newIndex = columnTasks.findIndex((t) => t.id === overTask.id);
        
        if (oldIndex === newIndex) return;
        
        // Reorder array
        const reordered = arrayMove(columnTasks, oldIndex, newIndex);
        
        // Update positions
        const updates = reordered.map((task, index) => ({
          id: task.id,
          position: index + 1
        }));
        
        // Optimistically update UI
        const newTasks = tasks.map(task => {
          if (task.status === destStatus) {
            const update = updates.find(u => u.id === task.id);
            return update ? { ...task, position: update.position } : task;
          }
          return task;
        });
        setTasks(newTasks);
        
        // Update in backend
        for (const update of updates) {
          await window.api.tasks.update(update.id, { position: update.position });
        }
        
        // Refresh to ensure consistency
        const res = await window.api.tasks.listByProject(activeProjectId);
        if (res.ok && res.data) setTasks(res.data);
        
        return;
      } else {
        // Moving to different column - insert at position
        destPosition = overTask.position;
      }
    } else if (typeof over.id === 'string') {
      // Dropped on column itself
      destStatus = over.id as KanbanStatus;
      const columnTasks = tasks.filter((t) => t.status === destStatus);
      destPosition = columnTasks.length + 1;
    } else {
      return;
    }

    // Don't do anything if dropped in same position
    if (activeTask.status === destStatus && activeTask.position === destPosition) return;

    try {
      await window.api.tasks.move({ 
        id: activeTask.id, 
        projectId: activeProjectId, 
        status: destStatus, 
        position: destPosition 
      });
      
      const res = await window.api.tasks.listByProject(activeProjectId);
      if (res.ok && res.data) setTasks(res.data);
      
      // Log activity
      if (activeTask.status !== destStatus) {
        useActivityStore.getState().pushActivity('task', `Moved task "${activeTask.title}" to ${destStatus}`);
      }
    } catch (e) {
      console.error('Move failed', e);
    }
  }

  return (
    <div style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      {!activeProjectId ? (
        // No project - show create prompt
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem',
            opacity: 0.5
          }}>
            📋
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
          }}>
            No Project Selected
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
            maxWidth: '400px'
          }}>
            Create your first project to start managing tasks with the Kanban board.
          </p>
          <div style={{
            padding: '1rem 2rem',
            borderRadius: '12px',
            background: 'rgba(3, 218, 198, 0.1)',
            border: '2px solid rgba(3, 218, 198, 0.3)',
            color: '#03DAC6',
            fontSize: '0.875rem'
          }}>
            💡 Click the project dropdown above to create a new project
          </div>
        </div>
      ) : (
        // Project exists - show kanban board
        <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Kanban</h2>
        
        {/* Settings Toggle */}
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          cursor: 'pointer',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          <input
            type="checkbox"
            checked={hideOldCompleted}
            onChange={toggleHideOldCompleted}
            style={{ cursor: 'pointer' }}
          />
          Hide old completed tasks
        </label>
      </div>
  <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd} 
        onDragStart={(e) => setActiveId(String(e.active?.id ?? null))}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
          {(['To-Do', 'In Progress', 'Completed'] as KanbanStatus[]).map((status) => (
            <KanbanColumn 
              key={status} 
              status={status} 
              tasks={filteredTasks.filter((t) => t.status === status)} 
              onCreateTask={handleCreateTask}
              onTaskDoubleClick={handleTaskDoubleClick}
            />
          ))}
        </div>
        <DragOverlay 
          dropAnimation={null}
        >
          {activeId ? (() => {
            const t = findTaskBySortableId(activeId);
            return t ? (
              <div style={{ 
                transform: 'rotate(3deg)', 
                transformOrigin: 'center',
                cursor: 'grabbing',
                opacity: 0.95,
                boxShadow: '0 12px 32px rgba(0,0,0,0.4)'
              }}>
                <TaskCard task={t} />
              </div>
            ) : null;
          })() : null}
        </DragOverlay>
      </DndContext>
      
      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
      </>
      )}
    </div>
  );
}
