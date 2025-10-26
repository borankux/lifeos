import React from 'react';
import type { Project } from '../../common/types';
import { ProjectSwitcher } from './ProjectSwitcher';
import { DateInfoModule } from './DateInfoModule';

interface NavBarProps {
  projects: Project[];
  activeProjectId?: number | null;
  onSelect: (id: number) => void;
  onCreate: (name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function NavBar({ projects, activeProjectId, onSelect, onCreate, onDelete }: NavBarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
      <ProjectSwitcher 
        projects={projects} 
        activeProjectId={activeProjectId ?? undefined} 
        onSelect={onSelect} 
        onCreate={onCreate}
        onDelete={onDelete}
      />
      <DateInfoModule />
    </div>
  );
}

export default NavBar;
