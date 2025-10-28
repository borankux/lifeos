import { useState, useRef, useEffect, type FormEvent } from 'react';
import type { Project } from '../../common/types';
import { ConfirmDialog } from './ConfirmDialog';

interface ProjectStats {
  taskCount: number;
  completedCount: number;
  inProgressCount: number;
}

interface ProjectWithStats extends Project {
  stats?: ProjectStats;
}

interface ProjectSwitcherProps {
  projects: Project[];
  activeProjectId?: number;
  onSelect: (projectId: number) => void;
  onCreate: (name: string) => Promise<void>;
  onDelete: (projectId: number) => Promise<void>;
}

export function ProjectSwitcher({ projects, activeProjectId, onSelect, onCreate, onDelete }: ProjectSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectStats, setProjectStats] = useState<Record<number, ProjectStats>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  // Fetch project statistics
  useEffect(() => {
    async function fetchProjectStats() {
      const stats: Record<number, ProjectStats> = {};
      
      for (const project of projects) {
        try {
          const response = await window.api.tasks.listByProject(project.id);
          if (response.ok && response.data) {
            const tasks = response.data;
            const completedCount = tasks.filter(t => t.status === 'Completed').length;
            const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
            
            stats[project.id] = {
              taskCount: tasks.length,
              completedCount,
              inProgressCount
            };
          }
        } catch (error) {
          console.error(`Failed to fetch stats for project ${project.id}:`, error);
          stats[project.id] = {
            taskCount: 0,
            completedCount: 0,
            inProgressCount: 0
          };
        }
      }
      
      setProjectStats(stats);
    }
    
    if (projects.length > 0) {
      fetchProjectStats();
    }
  }, [projects]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    const trimmed = newProjectName.trim();
    if (!trimmed) return;
    try {
      setCreating(true);
      await onCreate(trimmed);
      setNewProjectName('');
      setOpen(false);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!projectToDelete) return;
    try {
      await onDelete(projectToDelete.id);
      setProjectToDelete(null);
      setOpen(false);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }

  const active = projects.find((p) => p.id === activeProjectId) ?? projects[0];
  const hasNoProjects = projects.length === 0;

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          padding: '0.75rem 1.5rem',
          borderRadius: '12px',
          background: hasNoProjects 
            ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 193, 7, 0.15) 100%)'
            : 'linear-gradient(135deg, rgba(98, 0, 238, 0.1) 0%, rgba(3, 218, 198, 0.1) 100%)',
          border: hasNoProjects 
            ? '1px solid rgba(255, 152, 0, 0.3)'
            : '1px solid rgba(255, 255, 255, 0.1)',
          color: '#fff',
          minWidth: '220px',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          flex: 1,
        }}
      >
        {hasNoProjects ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
              <div style={{ fontSize: '1.2rem' }}>➕</div>
              <div style={{ fontWeight: 600 }}>Create First Project</div>
            </div>
            <div style={{ marginLeft: 'auto', opacity: 0.75, fontSize: '1rem' }}>▾</div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: active?.color ?? '#888', flexShrink: 0 }} />
              <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {active ? active.name : 'No projects'}
              </div>
            </div>
            {/* Project Statistics */}
            {active && projectStats[active.id] && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>📋</span>
                  <span>{projectStats[active.id].taskCount}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ color: '#03DAC6' }}>✓</span>
                  <span>{projectStats[active.id].completedCount}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ color: '#FF9800' }}>🔄</span>
                  <span>{projectStats[active.id].inProgressCount}</span>
                </div>
              </div>
            )}
            <div style={{ marginLeft: 'auto', opacity: 0.75, fontSize: '1rem' }}>▾</div>
          </>
        )}
      </div>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            width: 320,
            background: 'rgba(18,18,18,0.98)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            zIndex: 9999,
            padding: '0.5rem'
          }}
        >
          {hasNoProjects ? (
            <div style={{ 
              padding: '1rem', 
              color: 'var(--text-secondary)',
              textAlign: 'center',
              fontSize: '0.875rem'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
              <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>No Projects Yet</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
                Create your first project to get started!
              </div>
            </div>
          ) : (
            <div style={{ maxHeight: 220, overflow: 'auto' }}>
              {projects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 8,
                    background: project.id === activeProjectId ? 'rgba(3,218,198,0.08)' : 'transparent'
                  }}
                >
                  <div
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => {
                      onSelect(project.id);
                      setOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onSelect(project.id);
                        setOpen(false);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      flex: 1,
                      cursor: 'pointer',
                      minWidth: 0
                    }}
                  >
                    <div style={{ width: 10, height: 10, borderRadius: 6, background: project.color ?? '#888', flexShrink: 0 }} />
                    <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</div>
                    {/* Project Statistics in Dropdown */}
                    {projectStats[project.id] && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        fontSize: '0.65rem',
                        color: 'var(--text-secondary)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
                          <span>📋</span>
                          <span>{projectStats[project.id].taskCount}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
                          <span style={{ color: '#03DAC6' }}>✓</span>
                          <span>{projectStats[project.id].completedCount}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
                          <span style={{ color: '#FF9800' }}>🔄</span>
                          <span>{projectStats[project.id].inProgressCount}</span>
                        </div>
                      </div>
                    )}
                    {project.id === activeProjectId && <div style={{ opacity: 0.7, fontSize: 12, flexShrink: 0 }}>Active</div>}
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(project);
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: 6,
                      border: 'none',
                      background: 'transparent',
                      color: '#FF5252',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      opacity: 0.7,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.background = 'rgba(255, 82, 82, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.7';
                      e.currentTarget.style.background = 'transparent';
                    }}
                    title="Delete project"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              placeholder="Create project"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'transparent',
                color: '#fff'
              }}
            />
            <button
              type="submit"
              disabled={creating || !newProjectName.trim()}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
                background: creating ? 'rgba(255,255,255,0.06)' : '#03DAC6',
                border: 'none',
                cursor: creating || !newProjectName.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 700
              }}
            >
              {creating ? '...' : 'Add'}
            </button>
          </form>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!projectToDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.name}"? This will permanently delete all tasks and data associated with this project.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
}
