import React, { useEffect, useState } from 'react';
import useActivityStore from '../../store/activity';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { ActivityChart } from '../components/ActivityChart';
import { DashboardStats } from '../components/DashboardStats';
import { MetricsGauges } from '../components/MetricsGauges';
import { QAStats } from '../components/QAStats';
import { CountdownModule } from '../components/CountdownModule';
import { NotebookStatsModule } from '../components/NotebookStatsModule';
import type { Task, Project } from '../../common/types';

export default function Dashboard() {
  const activities = useActivityStore((s) => s.entries.slice(0, 20));
  const allActivities = useActivityStore((s) => s.entries);
  const isLoaded = useActivityStore((s) => s.isLoaded);
  const loadActivities = useActivityStore((s) => s.loadActivities);
  
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    todayTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    totalProjects: 0,
    activitiesThisWeek: 0,
    completionRate: 0,
    todayCompletionRate: 0,
    weeklyProductivity: 0,
    averageTasksPerDay: 0,
  });

  // Load activities from database on mount
  useEffect(() => {
    if (!isLoaded) {
      loadActivities();
    }
  }, [isLoaded, loadActivities]);

  // Load all projects and tasks for statistics
  useEffect(() => {
    async function loadStats() {
      try {
        // Load projects
        const projectsRes = await window.api.projects.list();
        if (projectsRes.ok && projectsRes.data) {
          setProjects(projectsRes.data.projects);
          
          // Load tasks from all projects
          const tasksPromises = projectsRes.data.projects.map(p => 
            window.api.tasks.listByProject(p.id)
          );
          const tasksResults = await Promise.all(tasksPromises);
          
          const allTasksData: Task[] = [];
          tasksResults.forEach(res => {
            if (res.ok && res.data) {
              allTasksData.push(...res.data);
            }
          });
          
          setAllTasks(allTasksData);
          
          // Calculate statistics
          const today = new Date().toISOString().split('T')[0];
          const todayTasksCount = allTasksData.filter(t => 
            t.createdAt?.startsWith(today)
          ).length;
          
          const completed = allTasksData.filter(t => t.status === 'Completed').length;
          const inProgress = allTasksData.filter(t => t.status === 'In Progress').length;
          const completionRate = allTasksData.length > 0 
            ? Math.round((completed / allTasksData.length) * 100) 
            : 0;
          
          // Today's completion rate
          const todayCompleted = allTasksData.filter(t => 
            t.status === 'Completed' && t.updatedAt?.startsWith(today)
          ).length;
          const todayTotal = allTasksData.filter(t => 
            t.createdAt?.startsWith(today) || t.updatedAt?.startsWith(today)
          ).length;
          const todayCompletionRate = todayTotal > 0 
            ? Math.round((todayCompleted / todayTotal) * 100)
            : 0;
          
          // Activities this week
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const weekActivities = allActivities.filter(a => 
            new Date(a.created_at) >= weekAgo
          ).length;
          
          // Weekly productivity (activities per day)
          const weeklyProductivity = Math.round(weekActivities / 7);
          
          // Average tasks completed per day (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const recentCompletedTasks = allTasksData.filter(t => 
            t.status === 'Completed' && 
            t.updatedAt && 
            new Date(t.updatedAt) >= thirtyDaysAgo
          ).length;
          const averageTasksPerDay = Math.round((recentCompletedTasks / 30) * 10) / 10;
          
          setStats({
            totalTasks: allTasksData.length,
            todayTasks: todayTasksCount,
            completedTasks: completed,
            inProgressTasks: inProgress,
            totalProjects: projectsRes.data.projects.length,
            activitiesThisWeek: weekActivities,
            completionRate,
            todayCompletionRate,
            weeklyProductivity,
            averageTasksPerDay,
          });
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    }
    
    loadStats();
  }, [allActivities]);

  return (
    <div>
      {/* Statistics Cards */}
      <DashboardStats
        completionRate={stats.completionRate}
        todayCompletionRate={stats.todayCompletionRate}
        weeklyProductivity={stats.weeklyProductivity}
        averageTasksPerDay={stats.averageTasksPerDay}
        totalTasks={stats.totalTasks}
        inProgressTasks={stats.inProgressTasks}
        completedTasks={stats.completedTasks}
      />

      {/* Activity Heatmap - Full Width at Top */}
      <div style={{ 
        marginTop: '1rem',
        width: '100%', 
        borderRadius: '12px', 
        background: 'var(--card-bg)', 
        border: '2px solid var(--card-border)',
        overflow: 'hidden'
      }}>
        <ActivityHeatmap activities={allActivities} weeksToShow={52} />
      </div>

      <section style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Row 1: Life Metrics (50%) + Countdown (50%) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <MetricsGauges />
          <CountdownModule />
        </div>

        {/* Row 2: Q&A Stats (50%) + Notebook Stats (50%) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <QAStats />
          <NotebookStatsModule />
        </div>

        {/* Row 3: Recent Activity and Daily Activity - Same height, side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Recent Activity Log */}
          <aside style={{ 
            borderRadius: 12, 
            padding: '1rem', 
            background: 'var(--card-bg)', 
            border: '2px solid var(--card-border)',
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Activity</h3>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {activities.length === 0 ? (
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
                  No recent activity
                </div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activities.map((a) => (
                    <li key={a.id} style={{ 
                      padding: '0.75rem', 
                      borderRadius: 8, 
                      background: 'var(--hover-bg)',
                      border: '1px solid var(--card-border)',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: 4,
                          background: a.type === 'task' 
                            ? 'rgba(3, 218, 198, 0.2)' 
                            : a.type === 'project' 
                            ? 'rgba(98, 0, 238, 0.2)' 
                            : 'rgba(255, 255, 255, 0.1)',
                          color: a.type === 'task'
                            ? '#03DAC6'
                            : a.type === 'project'
                            ? '#9333ea'
                            : '#fff',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {a.type}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{a.message}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                        {new Date(a.created_at).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          {/* Daily Activity Chart */}
          <ActivityChart activities={allActivities} daysToShow={14} />
        </div>
      </section>
    </div>
  );
}
