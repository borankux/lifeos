import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import type { Project, ProjectsListResult } from '../common/types';
import { NavBar } from './components/NavBar';
import TitleBar from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import KanbanPage from './pages/KanbanPage';
import NotebookPage from './pages/NotebookPage';
import HabitsPage from './pages/HabitsPage';
import QA from './pages/QA';
import SettingsPage from './pages/SettingsPage';
import { useThemeStore } from '../store/theme';

interface LayoutProps {
  projects: Project[];
  activeProjectId: number | null;
  onSelectProject: (id: number) => void;
  onCreateProject: (name: string) => Promise<void>;
  onDeleteProject: (id: number) => Promise<void>;
}

function Layout({ projects, activeProjectId, onSelectProject, onCreateProject, onDeleteProject }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Title bar at the top */}
      <TitleBar />
      
      {/* Main content area below title bar */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isSidebarCollapsed ? '70px 1fr' : '220px 1fr', 
        flex: 1, 
        overflow: 'hidden',
        transition: 'grid-template-columns 0.2s ease'
      }}>
        <aside style={{ 
          borderRight: '1px solid rgba(255,255,255,0.04)', 
          padding: '1rem', 
          overflow: 'auto',
          transition: 'all 0.2s ease'
        }}>
          <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        </aside>
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <header style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="no-drag">
            <NavBar 
              projects={projects} 
              activeProjectId={activeProjectId} 
              onSelect={onSelectProject} 
              onCreate={onCreateProject}
              onDelete={onDeleteProject}
            />
          </header>
          <main style={{ padding: '1rem', overflow: 'auto', flex: 1 }}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const loadTheme = useThemeStore((s) => s.loadTheme);
  const isThemeLoaded = useThemeStore((s) => s.isLoaded);

  useEffect(() => {
    void refreshProjects();
    void loadTheme();
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

  async function handleDeleteProject(id: number) {
    try {
      const res = await window.api.projects.delete(id);
      if (res.ok) {
        // Show success notification
        window.api.notification.show({
          type: 'success',
          title: 'Project Deleted',
          message: 'Project and all its tasks have been deleted.',
          duration: 3000
        });
        await refreshProjects();
      } else {
        console.error('Failed to delete project:', res.error);
        window.api.notification.show({
          type: 'error',
          title: 'Delete Failed',
          message: 'Failed to delete project. Please try again.',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      window.api.notification.show({
        type: 'error',
        title: 'Delete Failed',
        message: 'An error occurred while deleting the project.',
        duration: 3000
      });
    }
  }

  function handleSelectProject(id: number) {
    setActiveProjectId(id);
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout 
          projects={projects} 
          activeProjectId={activeProjectId} 
          onSelectProject={handleSelectProject} 
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
        />}>
          <Route index element={<Navigate to="/kanban" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="kanban" element={<KanbanPage activeProjectId={activeProjectId} />} />
          <Route path="notebook" element={<NotebookPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="qa" element={<QA />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/kanban" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
