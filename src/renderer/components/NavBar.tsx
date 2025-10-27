import React from 'react';
import { DateInfoModule } from './DateInfoModule';

export function NavBar() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
      <DateInfoModule />
    </div>
  );
}

export default NavBar;
