import { useState, useRef, useEffect, type FormEvent } from 'react';
import type { Project } from '../../common/types';

interface ProjectSwitcherProps {
  projects: Project[];
  activeProjectId?: number;
  onSelect: (projectId: number) => void;
  onCreate: (name: string) => Promise<void>;
}

export function ProjectSwitcher({ projects, activeProjectId, onSelect, onCreate }: ProjectSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: active?.color ?? '#888' }} />
          <div style={{ fontWeight: 600 }}>{active ? active.name : 'No projects'}</div>
        </div>
        <div style={{ marginLeft: 'auto', opacity: 0.75 }}>▾</div>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 320,
            background: 'rgba(18,18,18,0.98)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            zIndex: 40,
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
                    padding: '0.5rem 0.75rem',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: project.id === activeProjectId ? 'rgba(3,218,198,0.08)' : 'transparent'
                  }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: 6, background: project.color ?? '#888' }} />
                  <div style={{ flex: 1 }}>{project.name}</div>
                  {project.id === activeProjectId && <div style={{ opacity: 0.7, fontSize: 12 }}>Active</div>}
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
    </div>
  );
}
