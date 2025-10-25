import { ipcMain, BrowserWindow } from 'electron';

ipcMain.handle('window:minimize', () => {
  const w = BrowserWindow.getFocusedWindow();
  if (w) w.minimize();
  return true;
});

ipcMain.handle('window:close', () => {
  const w = BrowserWindow.getFocusedWindow();
  if (w) w.close();
  return true;
});

ipcMain.handle('window:is-maximized', () => {
  const w = BrowserWindow.getFocusedWindow();
  return !!w && w.isMaximized();
});

ipcMain.handle('window:toggle-maximize', () => {
  const w = BrowserWindow.getFocusedWindow();
  if (!w) return false;
  if (w.isMaximized()) w.unmaximize();
  else w.maximize();
  return true;
});
