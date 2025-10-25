import React from 'react';
import { NavLink } from 'react-router-dom';

export function Sidebar() {
  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'block',
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    background: isActive ? 'rgba(3,218,198,0.08)' : 'transparent',
    color: isActive ? '#03DAC6' : 'inherit',
    textDecoration: 'none',
    marginBottom: '0.25rem'
  });

  return (
    <nav>
      <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Main</h3>
      <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
      <NavLink to="/kanban" style={linkStyle}>Kanban</NavLink>
      <NavLink to="/diary" style={linkStyle}>Diary</NavLink>
      <NavLink to="/habits" style={linkStyle}>Habits</NavLink>
      <NavLink to="/notebook" style={linkStyle}>Notebook</NavLink>
      <NavLink to="/qa" style={linkStyle}>Q & A</NavLink>
    </nav>
  );
}

export default Sidebar;
