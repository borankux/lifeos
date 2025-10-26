import { app, BrowserWindow } from 'electron';
import path from 'path';
import { initDatabase } from '../database/init';

const isDev = process.env.NODE_ENV !== 'production';

let mainWindow: BrowserWindow | null = null;

// Register IPC handlers after Electron is ready
function registerIpcHandlers() {
  // Import IPC handlers here to ensure Electron is ready
  require('./ipc/projects');
  require('./ipc/tasks');
  require('./ipc/window');
  require('./ipc/activities');
  require('./ipc/settings');
  require('./ipc/notification');
  require('./ipc/metrics');
  require('./ipc/qa');
  require('./ipc/notebook');
}

async function createMainWindow() {
  // Get the app path to locate the icon
  const iconPath = isDev 
    ? path.join(__dirname, '../../LOGO.svg')  // Development: project root
    : path.join(process.resourcesPath, 'LOGO.svg');  // Production: packaged resources
  
  // Create the browser window with custom titlebar
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false, // Custom titlebar
    backgroundColor: '#121212',
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js')
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  
  if (isDev && devServerUrl) {
    // Development mode: Load Vite dev server
    await mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode: Load built HTML file
    const indexHtml = path.resolve(__dirname, '../renderer/index.html');
    await mainWindow.loadFile(indexHtml);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle management
app.whenReady().then(async () => {
  try {
    // Register IPC handlers first
    registerIpcHandlers();
    console.log('IPC handlers registered successfully');
    
    // Initialize database before creating window
    console.log('Initializing database...');
    await initDatabase();
    console.log('Database initialized successfully');
    
    await createMainWindow();
    console.log('Main window created successfully');
  } catch (error) {
    console.error('Error during app initialization:', error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
