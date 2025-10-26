import { ipcMain, BrowserWindow, screen } from 'electron';
import path from 'path';

interface NotificationOptions {
  type?: 'info' | 'success' | 'error' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

let notificationWindows: BrowserWindow[] = [];

function createNotificationWindow(options: NotificationOptions) {
  const { type = 'info', title, message, duration = 3000 } = options;
  
  // Get primary display
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  // Calculate position (bottom-right corner with offset)
  const windowWidth = 400;
  const windowHeight = 100;
  const margin = 16;
  const offset = notificationWindows.length * (windowHeight + margin);
  
  const x = width - windowWidth - margin;
  const y = height - windowHeight - margin - offset;
  
  // Create notification window
  const notificationWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x,
    y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    closable: true,
    focusable: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  
  // Build URL with query params
  const encodedTitle = encodeURIComponent(title);
  const encodedMessage = encodeURIComponent(message);
  const notificationUrl = `file://${path.join(__dirname, '..', '..', 'notification.html')}?type=${type}&title=${encodedTitle}&message=${encodedMessage}&duration=${duration}`;
  
  notificationWindow.loadURL(notificationUrl);
  
  // Show when ready
  notificationWindow.once('ready-to-show', () => {
    notificationWindow.show();
  });
  
  // Remove from array when closed
  notificationWindow.on('closed', () => {
    const index = notificationWindows.indexOf(notificationWindow);
    if (index > -1) {
      notificationWindows.splice(index, 1);
      // Reposition remaining notifications
      repositionNotifications();
    }
  });
  
  notificationWindows.push(notificationWindow);
  
  // Auto-close after duration
  setTimeout(() => {
    if (!notificationWindow.isDestroyed()) {
      notificationWindow.close();
    }
  }, duration + 500);
}

function repositionNotifications() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  const windowWidth = 400;
  const windowHeight = 100;
  const margin = 16;
  
  notificationWindows.forEach((win, index) => {
    if (!win.isDestroyed()) {
      const offset = index * (windowHeight + margin);
      const x = width - windowWidth - margin;
      const y = height - windowHeight - margin - offset;
      win.setPosition(x, y, true);
    }
  });
}

export function registerNotificationHandlers() {
  ipcMain.handle('notification:show', async (event, options: NotificationOptions) => {
    try {
      createNotificationWindow(options);
      return { ok: true };
    } catch (error: any) {
      console.error('Failed to show notification:', error);
      return { ok: false, error: error.message };
    }
  });
}

// Auto-register on module load
registerNotificationHandlers();
