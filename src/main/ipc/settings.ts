import { ipcMain } from 'electron';
import * as settingsService from '../../services/settings';
import { success, failure } from '../utils/response';

export function registerSettingsHandlers() {
  ipcMain.handle('settings:get', async () => {
    try {
      const settings = settingsService.loadSettings();
      return success(settings);
    } catch (err) {
      return failure((err as Error).message);
    }
  });

  ipcMain.handle('settings:update', async (_event, partial: Partial<settingsService.Settings>) => {
    try {
      settingsService.updateSettings(partial);
      const updated = settingsService.loadSettings();
      return success(updated);
    } catch (err) {
      return failure((err as Error).message);
    }
  });
}

// Register handlers immediately when module is loaded
registerSettingsHandlers();
