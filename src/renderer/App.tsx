import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import type { Project, ProjectsListResult } from '../common/types';
import { NavBar } from './components/NavBar';
import TitleBar from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import KanbanPage from './pages/KanbanPage';
import DiaryPage from './pages/DiaryPage';
import HabitsPage from './pages/HabitsPage';
import NotebookPage from './pages/NotebookPage';
import QA from './pages/QA';

interface LayoutProps {
  projects: Project[];
  activeProjectId: number | null;
  onSelectProject: (id: number) => void;
  onCreateProject: (name: string) => Promise<void>;
}

function Layout({ projects, activeProjectId, onSelectProject, onCreateProject }: LayoutProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', height: '100vh' }}>
      <aside style={{ borderRight: '1px solid rgba(255,255,255,0.04)', padding: '1rem' }}>
        <Sidebar />
      </aside>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{ padding: '0.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <TitleBar />
          <div className="no-drag">
            <NavBar projects={projects} activeProjectId={activeProjectId} onSelect={onSelectProject} onCreate={onCreateProject} />
          </div>
        </header>
        <main style={{ padding: '1rem', overflow: 'auto', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);

  useEffect(() => {
    void refreshProjects();
  }, []);

  async function refreshProjects() {
    try {
      const response = await window.api.projects.list();
      if (response.ok && response.data) {
        const { projects: loadedProjects, activeProjectId: loadedActiveId } = response.data;
        setProjects(loadedProjects);
        setActiveProjectId(
          typeof loadedActiveId === 'number'
            ? loadedActiveId
            : loadedProjects.length > 0
            ? loadedProjects[0].id
            : null
        );
      } else {
        console.error('Failed to load projects:', response.error);
        setProjects([]);
        setActiveProjectId(null);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
      setActiveProjectId(null);
    }
  }

  async function handleCreateProject(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }
    try {
      const res = await window.api.projects.create({ name: trimmedName });
      if (res.ok) {
        await refreshProjects();
      } else {
        console.error('Failed to create project:', res.error);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  }

  function handleSelectProject(id: number) {
    setActiveProjectId(id);
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout projects={projects} activeProjectId={activeProjectId} onSelectProject={handleSelectProject} onCreateProject={handleCreateProject} />}>
          <Route index element={<Navigate to="/kanban" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="kanban" element={<KanbanPage activeProjectId={activeProjectId} />} />
          <Route path="diary" element={<DiaryPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="notebook" element={<NotebookPage />} />
          <Route path="qa" element={<QA />} />
          <Route path="*" element={<Navigate to="/kanban" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
