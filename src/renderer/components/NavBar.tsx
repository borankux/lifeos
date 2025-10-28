import React from 'react';
import { DateInfoModule } from './DateInfoModule';
import { CountdownModule } from './CountdownModule';

export function NavBar() {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1.5rem',
      padding: '0.75rem 1.5rem',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, rgba(98, 0, 238, 0.1) 0%, rgba(3, 218, 198, 0.1) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      width: '100%',
      minWidth: 0,
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Fade overlay for overflow */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '40px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(18, 18, 18, 0.95) 100%)',
        pointerEvents: 'none',
        zIndex: 1
      }} />
      
      <DateInfoModule />
      
      {/* Divider */}
      <div style={{ 
        width: '1px', 
        height: '48px', 
        background: 'rgba(255, 255, 255, 0.1)',
        flexShrink: 0
      }} />
      
      {/* Countdown Cards */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <CountdownModule />
      </div>
    </div>
  );
}

export default NavBar;
