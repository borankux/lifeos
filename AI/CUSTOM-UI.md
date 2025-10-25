# Custom UI & Titlebar

## Custom Titlebar Implementation

### Design Goals
- **Native feel**: Platform-appropriate styling (Windows/macOS/Linux)
- **Brand consistency**: LifeOS branding and colors
- **Accessibility**: Keyboard navigation and screen reader support
- **Performance**: Smooth animations and responsive interactions

### Titlebar Structure

#### **Layout Components**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] LifeOS                    [─] [□] [✕] (Windows) │
│                                                         │
│ [≡] Sidebar  │  [Project Switcher]  │  [User Menu]      │
└─────────────────────────────────────────────────────────┘
```

#### **Windows Titlebar**
- **Left**: App logo + title
- **Right**: Minimize, Maximize, Close buttons
- **Height**: 32px (standard Windows titlebar height)
- **Colors**: System theme-aware

#### **macOS Titlebar**
- **Left**: Traffic light buttons (red, yellow, green)
- **Center**: App title
- **Right**: Custom controls (search, settings, etc.)
- **Height**: 28px (standard macOS titlebar height)

#### **Linux Titlebar**
- **Left**: App icon + title
- **Right**: Window controls (varies by desktop environment)
- **Height**: 32px (standard Linux titlebar height)

### Implementation

#### **Main Process Setup**
```typescript
// src/main/window.ts
import { BrowserWindow, Menu } from 'electron';
import { createCustomTitlebar } from './titlebar';

export function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false, // Remove default frame
    titleBarStyle: 'hidden', // Hide default titlebar
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js')
    }
  });

  // Create custom titlebar
  createCustomTitlebar(mainWindow);
  
  return mainWindow;
}
```

#### **Custom Titlebar Component**
```typescript
// src/main/titlebar.ts
import { BrowserWindow, ipcMain } from 'electron';

export function createCustomTitlebar(window: BrowserWindow) {
  // Send titlebar data to renderer
  window.webContents.once('dom-ready', () => {
    window.webContents.send('titlebar:init', {
      platform: process.platform,
      isMaximized: window.isMaximized(),
      isFullScreen: window.isFullScreen()
    });
  });

  // Handle window controls
  ipcMain.handle('titlebar:minimize', () => {
    window.minimize();
  });

  ipcMain.handle('titlebar:maximize', () => {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  });

  ipcMain.handle('titlebar:close', () => {
    window.close();
  });

  // Handle window state changes
  window.on('maximize', () => {
    window.webContents.send('titlebar:maximized', true);
  });

  window.on('unmaximize', () => {
    window.webContents.send('titlebar:maximized', false);
  });
}
```

#### **Renderer Titlebar Component**
```tsx
// src/renderer/components/CustomTitlebar.tsx
import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

interface TitlebarProps {
  platform: string;
  isMaximized: boolean;
  isFullScreen: boolean;
}

export const CustomTitlebar: React.FC<TitlebarProps> = ({ 
  platform, 
  isMaximized, 
  isFullScreen 
}) => {
  const [maximized, setMaximized] = useState(isMaximized);

  useEffect(() => {
    const handleMaximized = (_event: any, maximized: boolean) => {
      setMaximized(maximized);
    };

    window.electronAPI.on('titlebar:maximized', handleMaximized);
    return () => {
      window.electronAPI.removeListener('titlebar:maximized', handleMaximized);
    };
  }, []);

  const handleMinimize = () => {
    window.electronAPI.invoke('titlebar:minimize');
  };

  const handleMaximize = () => {
    window.electronAPI.invoke('titlebar:maximize');
  };

  const handleClose = () => {
    window.electronAPI.invoke('titlebar:close');
  };

  const renderWindowControls = () => {
    if (platform === 'darwin') {
      // macOS traffic lights
      return (
        <div className="flex items-center space-x-2 ml-4">
          <button 
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
            onClick={handleClose}
            aria-label="Close"
          />
          <button 
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
            onClick={handleMinimize}
            aria-label="Minimize"
          />
          <button 
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
            onClick={handleMaximize}
            aria-label="Maximize"
          />
        </div>
      );
    } else {
      // Windows/Linux controls
      return (
        <div className="flex items-center">
          <button 
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={handleMinimize}
            aria-label="Minimize"
          >
            <Icon name="Minus" size={16} />
          </button>
          <button 
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={handleMaximize}
            aria-label={maximized ? "Restore" : "Maximize"}
          >
            <Icon name={maximized ? "Square" : "Maximize"} size={16} />
          </button>
          <button 
            className="p-1 hover:bg-red-500 hover:text-white transition-colors"
            onClick={handleClose}
            aria-label="Close"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      );
    }
  };

  return (
    <div className="h-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center space-x-3">
        <Icon name="LifeOS" size={20} className="text-purple-600" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          LifeOS
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Custom controls can go here */}
        <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <Icon name="Search" size={16} />
        </button>
        <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <Icon name="Settings" size={16} />
        </button>
      </div>

      {renderWindowControls()}
    </div>
  );
};
```

### Menu System

#### **Remove Default Menu**
```typescript
// src/main/index.ts
import { app, Menu } from 'electron';

// Remove default menu
Menu.setApplicationMenu(null);

// Or create custom menu
const customMenu = Menu.buildFromTemplate([
  {
    label: 'File',
    submenu: [
      {
        label: 'New Project',
        accelerator: 'CmdOrCtrl+N',
        click: () => createNewProject()
      },
      {
        label: 'Settings',
        accelerator: 'CmdOrCtrl+,',
        click: () => openSettings()
      },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => app.quit()
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  }
]);

Menu.setApplicationMenu(customMenu);
```

#### **Context Menu**
```typescript
// src/main/contextMenu.ts
import { Menu, MenuItem } from 'electron';

export function createContextMenu() {
  return new Menu();
}

// Add context menu items
const contextMenu = new Menu();
contextMenu.append(new MenuItem({
  label: 'Cut',
  role: 'cut'
}));
contextMenu.append(new MenuItem({
  label: 'Copy',
  role: 'copy'
}));
contextMenu.append(new MenuItem({
  label: 'Paste',
  role: 'paste'
}));

// Apply to webContents
window.webContents.on('context-menu', (event, params) => {
  contextMenu.popup();
});
```

### Styling & Theming

#### **CSS Variables**
```css
/* src/renderer/styles/titlebar.css */
:root {
  --titlebar-height: 32px;
  --titlebar-bg: #ffffff;
  --titlebar-text: #000000;
  --titlebar-border: #e5e7eb;
}

[data-theme="dark"] {
  --titlebar-bg: #1f2937;
  --titlebar-text: #ffffff;
  --titlebar-border: #374151;
}

.custom-titlebar {
  height: var(--titlebar-height);
  background-color: var(--titlebar-bg);
  color: var(--titlebar-text);
  border-bottom: 1px solid var(--titlebar-border);
}
```

#### **Platform-Specific Styles**
```css
/* Windows */
.platform-win32 .titlebar {
  -webkit-app-region: drag;
}

.platform-win32 .titlebar button {
  -webkit-app-region: no-drag;
}

/* macOS */
.platform-darwin .titlebar {
  -webkit-app-region: drag;
}

.platform-darwin .titlebar button {
  -webkit-app-region: no-drag;
}

/* Linux */
.platform-linux .titlebar {
  -webkit-app-region: drag;
}

.platform-linux .titlebar button {
  -webkit-app-region: no-drag;
}
```

### Accessibility

#### **Keyboard Navigation**
```typescript
// src/renderer/components/CustomTitlebar.tsx
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.altKey && event.key === 'F4') {
      handleClose();
    }
    if (event.altKey && event.key === 'F10') {
      // Focus titlebar
      titlebarRef.current?.focus();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

#### **Screen Reader Support**
```tsx
<div 
  className="custom-titlebar"
  role="banner"
  aria-label="Application titlebar"
>
  <button
    aria-label="Minimize window"
    onClick={handleMinimize}
  >
    <Icon name="Minus" size={16} />
  </button>
</div>
```

### Performance

#### **Optimization Strategies**
- **Event delegation**: Use single event listener for titlebar
- **Debounced resize**: Debounce window resize events
- **Lazy loading**: Load titlebar components only when needed
- **Memory management**: Clean up event listeners on unmount

#### **Animation Performance**
```css
.titlebar-button {
  transition: background-color 150ms ease-out;
  will-change: background-color;
}

.titlebar-button:hover {
  background-color: var(--hover-bg);
}
```

### Testing

#### **Unit Tests**
```typescript
// src/renderer/components/__tests__/CustomTitlebar.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { CustomTitlebar } from '../CustomTitlebar';

describe('CustomTitlebar', () => {
  it('should render window controls', () => {
    const { getByLabelText } = render(
      <CustomTitlebar platform="win32" isMaximized={false} isFullScreen={false} />
    );
    
    expect(getByLabelText('Minimize')).toBeInTheDocument();
    expect(getByLabelText('Maximize')).toBeInTheDocument();
    expect(getByLabelText('Close')).toBeInTheDocument();
  });

  it('should handle minimize click', () => {
    const mockInvoke = jest.fn();
    window.electronAPI = { invoke: mockInvoke };
    
    const { getByLabelText } = render(
      <CustomTitlebar platform="win32" isMaximized={false} isFullScreen={false} />
    );
    
    fireEvent.click(getByLabelText('Minimize'));
    expect(mockInvoke).toHaveBeenCalledWith('titlebar:minimize');
  });
});
```

### Future Enhancements

#### **Advanced Features**
- **Drag regions**: Custom drag areas for window movement
- **Window snapping**: Snap to edges and corners
- **Multi-window support**: Titlebar for multiple windows
- **Custom themes**: User-defined titlebar styles
- **Animation effects**: Smooth transitions and micro-interactions
