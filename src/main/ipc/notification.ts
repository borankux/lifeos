import { ipcMain, BrowserWindow } from 'electron';

interface NotificationOptions {
  type?: 'info' | 'success' | 'error' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

export function registerNotificationHandlers() {
  ipcMain.handle('notification:show', async (event, options: NotificationOptions) => {
    try {
      // Send notification to the renderer process that made the request
      const senderWindow = BrowserWindow.fromWebContents(event.sender);
      if (senderWindow && !senderWindow.isDestroyed()) {
        senderWindow.webContents.send('notification:display', options);
      }
      return { ok: true };
    } catch (error: any) {
      console.error('Failed to show notification:', error);
      return { ok: false, error: error.message };
    }
  });
}

// Auto-register on module load
registerNotificationHandlers();
