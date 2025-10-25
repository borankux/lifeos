import { app, BrowserWindow, nativeTheme } from 'electron';
import path from 'path';
import './ipc/projects';
import './ipc/tasks';
import './ipc/window';
import { initDatabase } from '../database/init';

const isDev = process.env.NODE_ENV !== 'production';

import fs from 'fs';

function getPreloadPath() {
  // Prefer a built JS preload if it exists (works for both dev and prod when using built main).
  const builtPreloadJs = path.resolve(__dirname, '../preload/index.js');
  const builtPreloadTs = path.resolve(__dirname, '../preload/index.ts');
  const srcPreloadTs = path.resolve(__dirname, '../../src/preload/index.ts');

  if (fs.existsSync(builtPreloadJs)) {
    return builtPreloadJs;
  }

  // Fallback: if a TS preload exists next to the built main (rare), use it.
  if (fs.existsSync(builtPreloadTs)) {
    return builtPreloadTs;
  }

  // Finally, if running from source with ts-node or similar, load the src preload.
  if (fs.existsSync(srcPreloadTs)) {
    return srcPreloadTs;
  }

  // Default to the built JS preload path even if it doesn't exist; electron will report a clear error.
  return builtPreloadJs;
}

async function createMainWindow() {
  await initDatabase();

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 640,
    frame: false, // custom titlebar
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#121212' : '#ffffff',
    webPreferences: {
      preload: getPreloadPath(),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  // Set Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' data: blob:; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: blob:; " +
          "font-src 'self' data:; " +
          "connect-src 'self' ws: wss:;"
        ]
      }
    });
  });

  if (isDev && devServerUrl) {
    await mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexHtml = path.resolve(__dirname, '../renderer/index.html');
    await mainWindow.loadFile(indexHtml);
  }
}

app.whenReady().then(async () => {
  await createMainWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
