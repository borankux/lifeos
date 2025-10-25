import React from 'react';

export default function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <p>Activity calendar (GitHub-style) will appear here. This dashboard aggregates diary entries, tasks, habits and other activity.</p>

      <section style={{ marginTop: '1rem' }}>
        <div style={{ width: '100%', minHeight: '160px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <em>Activity calendar placeholder — heatmap will render here</em>
        </div>
      </section>
    </div>
  );
}
