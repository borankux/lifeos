import { ipcMain } from 'electron';

interface NotificationOptions {
  type?: 'info' | 'success' | 'error' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

export function registerNotificationHandlers() {
  ipcMain.handle('notification:show', async (event, options: NotificationOptions) => {
    try {
      // The notification will be handled on the renderer side via the NotificationModal component
      // Just acknowledge receipt
      return { ok: true };
    } catch (error: any) {
      console.error('Failed to show notification:', error);
      return { ok: false, error: error.message };
    }
  });
}

// Auto-register on module load
registerNotificationHandlers();
