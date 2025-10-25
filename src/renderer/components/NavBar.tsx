import React from 'react';
import type { Project } from '../../common/types';
import { ProjectSwitcher } from './ProjectSwitcher';

interface NavBarProps {
  projects: Project[];
  activeProjectId?: number | null;
  onSelect: (id: number) => void;
  onCreate: (name: string) => Promise<void>;
}

export function NavBar({ projects, activeProjectId, onSelect, onCreate }: NavBarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <ProjectSwitcher projects={projects} activeProjectId={activeProjectId ?? undefined} onSelect={onSelect} onCreate={onCreate} />
    </div>
  );
}

export default NavBar;
