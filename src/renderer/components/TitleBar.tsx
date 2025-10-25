import React, { useEffect, useState } from 'react';

export function TitleBar() {
  const [isMax, setIsMax] = useState(false);

  useEffect(() => {
    // poll maximized state once on mount
    void (async () => {
      try {
        // @ts-ignore - exposed by preload
        const maximized = await window.windowControls.isMaximized();
        setIsMax(!!maximized);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  async function onMinimize() {
    // @ts-ignore
    await window.windowControls.minimize();
  }

  async function onToggleMax() {
    // @ts-ignore
    await window.windowControls.toggleMaximize();
    // flip local state (best-effort)
    setIsMax((v) => !v);
  }

  async function onClose() {
    // @ts-ignore
    await window.windowControls.close();
  }

  return (
    <div className="titlebar">
      <div className="titlebar-left">
        <div style={{ fontWeight: 700 }}>LifeOS</div>
      </div>
      <div className="titlebar-controls">
        <button onClick={onMinimize} className="titlebar-btn" aria-label="Minimize">
          —
        </button>
        <button onClick={onToggleMax} className="titlebar-btn" aria-label="Maximize">
          {isMax ? '🗗' : '☐'}
        </button>
        <button onClick={onClose} className="titlebar-btn titlebar-close" aria-label="Close">
          ✕
        </button>
      </div>
    </div>
  );
}

const controlStyle: React.CSSProperties = {};

export default TitleBar;
