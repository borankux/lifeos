import { useState, type FormEvent } from 'react';
import type { Project } from '../../common/types';

interface ProjectSwitcherProps {
  projects: Project[];
  activeProjectId?: number;
  onSelect: (projectId: number) => void;
  onCreate: (name: string) => Promise<void>;
}

export function ProjectSwitcher({ projects, activeProjectId, onSelect, onCreate }: ProjectSwitcherProps) {
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newProjectName.trim()) {
      return;
    }
    try {
      setCreating(true);
      await onCreate(newProjectName.trim());
      setNewProjectName('');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem', gap: '0.25rem' }}>
        <span style={{ opacity: 0.7 }}>Project</span>
        <select
          value={activeProjectId ?? ''}
          onChange={(event) => onSelect(Number(event.target.value))}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            minWidth: '220px'
          }}
        >
          {projects.length === 0 ? <option value="">No projects yet</option> : null}
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          placeholder="New project name"
          value={newProjectName}
          onChange={(event) => setNewProjectName(event.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(0,0,0,0.2)',
            color: '#fff'
          }}
        />
        <button
          type="submit"
          disabled={creating || !newProjectName.trim()}
          style={{
            padding: '0.5rem 0.9rem',
            borderRadius: '8px',
            border: 'none',
            background: creating ? 'rgba(255,255,255,0.1)' : '#03DAC6',
            color: creating ? '#888' : '#121212',
            cursor: creating || !newProjectName.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 600
          }}
        >
          Add
        </button>
      </form>
    </div>
  );
}
