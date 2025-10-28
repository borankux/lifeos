import React, { useEffect, useState } from 'react';
import type { Task, Project } from '../../common/types';
import { KanbanColumn } from '../components/KanbanColumn';
import { ProjectSwitcher } from '../components/ProjectSwitcher';
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
  projects?: Project[];
  onSelectProject?: (id: number) => void;
  onCreateProject?: (name: string) => Promise<void>;
  onDeleteProject?: (id: number) => Promise<void>;
}

export default function KanbanPage({ activeProjectId, projects, onSelectProject, onCreateProject, onDeleteProject }: KanbanPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [hideOldCompleted, setHideOldCompleted] = useState(false);
  const [showArchivedView, setShowArchivedView] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);

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
    // Save selection to localStorage for persistence
    if (activeProjectId) {
      localStorage.setItem(`kanban_selected_task_${activeProjectId}`, String(task.id));
    }
  };

  const handleCloseTaskDetail = () => {
    setSelectedTask(null);
    // Clear selection from localStorage
    if (activeProjectId) {
      localStorage.removeItem(`kanban_selected_task_${activeProjectId}`);
    }
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

  const handleRestoreToBacklog = async (taskId: number) => {
    if (!activeProjectId) return;
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        await window.api.tasks.update(taskId, { status: 'Backlog' } as any);
        const res = await window.api.tasks.listByProject(activeProjectId);
        if (res.ok && res.data) setTasks(res.data.filter(t => t.status !== 'Deleted'));
        useActivityStore.getState().pushActivity('task', `Restored "${task.title}" to Backlog`);
        
        window.api.notification.show({
          type: 'success',
          title: 'Task Restored',
          message: `"${task.title}" moved to Backlog`,
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Failed to restore task:', error);
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
          // Filter out deleted tasks
          const filteredData = res.data.filter(t => t.status !== 'Deleted');
          setTasks(filteredData);
          
          // Restore selected task from localStorage
          const savedTaskId = localStorage.getItem(`kanban_selected_task_${activeProjectId}`);
          if (savedTaskId) {
            const taskToSelect = filteredData.find(t => t.id === parseInt(savedTaskId));
            if (taskToSelect) {
              setSelectedTask(taskToSelect);
            } else {
              // Task no longer exists, clear localStorage
              localStorage.removeItem(`kanban_selected_task_${activeProjectId}`);
            }
          }
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

  async function handleCreateProjectSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = newProjectName.trim();
    if (!trimmed || !onCreateProject) return;
    try {
      setCreating(true);
      await onCreateProject(trimmed);
      setNewProjectName('');
    } finally {
      setCreating(false);
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
    <div style={{ 
      userSelect: 'none', 
      WebkitUserSelect: 'none',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
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
          
          {/* Project Creation Form */}
          <div style={{
            width: '100%',
            maxWidth: '400px',
            padding: '2rem',
            borderRadius: '12px',
            background: 'rgba(18,18,18,0.98)',
            border: '2px solid rgba(3, 218, 198, 0.3)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
          }}>
            <div style={{ 
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
              <div style={{ fontWeight: 600, fontSize: '1.125rem', color: '#fff', marginBottom: '0.25rem' }}>Create Your First Project</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Projects help you organize tasks and goals</div>
            </div>
            
            <form onSubmit={handleCreateProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                placeholder="Enter project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                autoFocus
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 8,
                  border: '2px solid rgba(3, 218, 198, 0.3)',
                  background: 'rgba(3, 218, 198, 0.05)',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(3, 218, 198, 0.6)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(3, 218, 198, 0.3)';
                }}
              />
              <button
                type="submit"
                disabled={creating || !newProjectName.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 8,
                  background: creating ? 'rgba(255,255,255,0.06)' : (newProjectName.trim() ? '#03DAC6' : 'rgba(3, 218, 198, 0.3)'),
                  border: 'none',
                  cursor: creating || !newProjectName.trim() ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  color: newProjectName.trim() ? '#000' : '#666'
                }}
              >
                {creating ? 'Creating...' : '➕ Create Project'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        // Project exists - show kanban board
        <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '0 1 auto' }}>
          <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Kanban</h2>
          {projects && onSelectProject && onCreateProject && onDeleteProject && (
            <ProjectSwitcher
              projects={projects}
              activeProjectId={activeProjectId ?? undefined}
              onSelect={onSelectProject}
              onCreate={onCreateProject}
              onDelete={onDeleteProject}
            />
          )}
        </div>
        
        {/* Settings Toggles */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: '0 1 auto' }}>
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
          
          <button
            onClick={() => setShowArchivedView(!showArchivedView)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: `2px solid ${showArchivedView ? '#03DAC6' : 'var(--card-border)'}`,
              background: showArchivedView ? 'rgba(3, 218, 198, 0.15)' : 'var(--card-bg)',
              color: showArchivedView ? '#03DAC6' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            📦 {showArchivedView ? 'Hide' : 'View'} Archived
          </button>
        </div>
      </div>
  <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd} 
        onDragStart={(e) => setActiveId(String(e.active?.id ?? null))}
      >
        {showArchivedView ? (
          /* Archived View - Show completed tasks */
          <div style={{ 
            padding: '1.5rem', 
            borderRadius: '12px', 
            background: 'var(--card-bg)', 
            border: '2px solid var(--card-border)',
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600, flexShrink: 0 }}>Archived Completed Tasks</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, minHeight: 0, overflowY: 'auto' }}>
              {tasks.filter(t => t.status === 'Completed' && !filteredTasks.includes(t)).length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem', 
                  color: 'var(--text-tertiary)' 
                }}>
                  No archived completed tasks
                </div>
              ) : (
                tasks
                  .filter(t => t.status === 'Completed' && !filteredTasks.includes(t))
                  .map(task => (
                    <div key={task.id} style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      background: 'var(--hover-bg)',
                      border: '2px solid var(--card-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{task.title}</div>
                        {task.description && (
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            {task.description.substring(0, 100)}...
                          </div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          Completed: {new Date(task.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRestoreToBacklog(task.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#03DAC6',
                          color: '#121212',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ↺ Restore to Backlog
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        ) : (
          /* Normal Kanban View */
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '1rem', 
            flex: 1,
            minHeight: 0,
            overflow: 'hidden'
          }}>
            {(['Backlog', 'To-Do', 'In Progress', 'Completed'] as KanbanStatus[]).map((status) => (
              <KanbanColumn 
                key={status} 
                status={status} 
                tasks={filteredTasks.filter((t) => t.status === status)} 
                onCreateTask={handleCreateTask}
                onTaskDoubleClick={handleTaskDoubleClick}
              />
            ))}
          </div>
        )}
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
          onClose={handleCloseTaskDetail}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
      </>
      )}
    </div>
  );
}
