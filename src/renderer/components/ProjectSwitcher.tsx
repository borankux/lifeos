import { useState, useRef, useEffect, type FormEvent } from 'react';
import type { Project } from '../../common/types';
import { ConfirmDialog } from './ConfirmDialog';

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

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#fff',
          minWidth: '220px',
          textAlign: 'left',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: active?.color ?? '#888', flexShrink: 0 }} />
          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {active ? active.name : 'No projects'}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', opacity: 0.75 }}>▾</div>
      </button>

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
          <div style={{ maxHeight: 220, overflow: 'auto' }}>
            {projects.length === 0 ? (
              <div style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>No projects yet</div>
            ) : (
              projects.map((project) => (
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
              ))
            )}
          </div>

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
