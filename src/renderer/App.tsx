import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import type { Project } from '../common/types';
import { NavBar } from './components/NavBar';
import { Sidebar } from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import KanbanPage from './pages/KanbanPage';
import DiaryPage from './pages/DiaryPage';
import HabitsPage from './pages/HabitsPage';
import NotebookPage from './pages/NotebookPage';
import QA from './pages/QA';

function Layout({ projects, activeProjectId, onSelectProject, onCreateProject }: any) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', height: '100vh' }}>
      <aside style={{ borderRight: '1px solid rgba(255,255,255,0.04)', padding: '1rem' }}>
        <Sidebar />
      </aside>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontSize: '1.125rem' }}>LifeOS</h1>
          <NavBar projects={projects} activeProjectId={activeProjectId} onSelect={onSelectProject} onCreate={onCreateProject} />
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
    window.api.projects.list().then((response: any) => {
      if (response.ok && response.data) {
        setProjects(response.data);
        if (response.data.length > 0) {
          setActiveProjectId(response.data[0].id);
        }
      }
    });
  }, []);

  async function handleCreateProject(name: string) {
    const res = await window.api.projects.create({ name });
    if (res.ok && res.data) {
      // refresh list
      const list = await window.api.projects.list();
      if (list.ok && list.data) setProjects(list.data);
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
