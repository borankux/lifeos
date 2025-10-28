import { app, BrowserWindow } from 'electron';
import path from 'path';
import { initDatabase } from '../database/init';

const isDev = process.env.NODE_ENV !== 'production';

let mainWindow: BrowserWindow | null = null;
export let databaseAvailable = true;

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
  require('./ipc/database');
  require('./ipc/habits');
  require('./ipc/mcp');
  require('./ipc/serverLogs');
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
    const dbInitResult = await initDatabase();
    if (dbInitResult) {
      console.log('Database initialized successfully');
      databaseAvailable = true;
    } else {
      console.log('Database initialization failed - running in limited mode');
      databaseAvailable = false;
    }
    
    await createMainWindow();
    console.log('Main window created successfully');
    
    // Start MCP server if auto-start is enabled (after window is created)
    try {
      const { startMCPServer, getMCPServerStatus } = require('./ipc/mcp');
      const mcpRepo = require('../database/mcpRepo');
      const mcpConfig = mcpRepo.getMCPConfig();
      
      console.log('MCP Config:', mcpConfig);
      
      if (mcpConfig && mcpConfig.enabled && mcpConfig.autoStart) {
        console.log('Auto-starting MCP server...');
        const started = await startMCPServer();
        if (started) {
          const status = getMCPServerStatus();
          console.log('✓ MCP server auto-started successfully');
          console.log('  Status:', status);
        } else {
          const status = getMCPServerStatus();
          console.error('✗ MCP server auto-start failed');
          console.error('  Error:', status.error || 'Unknown error');
        }
      } else {
        console.log('MCP auto-start disabled or server not enabled');
        console.log('  enabled:', mcpConfig?.enabled, 'autoStart:', mcpConfig?.autoStart);
      }
    } catch (error) {
      console.error('✗ Failed to auto-start MCP server:', error);
      console.error('  Stack:', error instanceof Error ? error.stack : 'No stack');
    }
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
