import React from 'react';
import useActivityStore from '../../store/activity';

export default function Dashboard() {
  const activities = useActivityStore((s) => s.entries.slice(0, 20));

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Activity calendar (GitHub-style) will appear here. This dashboard aggregates diary entries, tasks, habits and other activity.</p>

      <section style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem' }}>
        <div>
          <div style={{ width: '100%', minHeight: '160px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <em>Activity calendar placeholder — heatmap will render here</em>
          </div>
        </div>
        <aside style={{ borderRadius: 8, padding: '0.5rem', background: 'rgba(255,255,255,0.02)', height: '100%' }}>
          <h3 style={{ marginTop: 0 }}>Recent Activity</h3>
          {activities.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.7)' }}>No recent activity</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activities.map((a) => (
                <li key={a.id} style={{ padding: '0.5rem', borderRadius: 8, background: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{a.message}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{new Date(a.timestamp).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </div>
  );
}
