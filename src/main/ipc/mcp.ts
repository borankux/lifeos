import { ipcMain } from 'electron';
import * as mcpRepo from '../../database/mcpRepo';
import { MCPConfig, MCPServerStatus, UpdateMCPConfigPayload } from '../../common/types';
import { success, failure } from '../utils/response';
import { spawn } from 'child_process';
import path from 'path';

// Global MCP server instance
let mcpServerProcess: any = null;
let mcpServerStartTime: number | null = null;

export async function startMCPServer(): Promise<boolean> {
  if (mcpServerProcess) {
    console.log('MCP Server already running');
    return true;
  }

  try {
    const config = mcpRepo.getMCPConfig();
    const fs = require('fs');
    const appPath = require('electron').app.getAppPath();
    
    // Check if the compiled server exists - use app path for reliability
    const serverPath = path.join(appPath, 'dist/server/mcp-server.js');
    if (!fs.existsSync(serverPath)) {
      console.warn('MCP Server binary not found, skipping auto-start. Run build first.');
      return false;
    }
    
    // Start the MCP server as a separate process
    mcpServerProcess = spawn('node', [serverPath], {
      env: {
        ...process.env,
        MCP_SERVER_PORT: String(config.port),
        MCP_SERVER_HOST: config.host,
        NODE_ENV: process.env.NODE_ENV || 'development'
      },
      stdio: 'pipe' // Pipe stdout/stderr instead of inheriting console
    });

    mcpServerProcess.on('error', (error: Error) => {
      console.error('MCP Server process error:', error);
      mcpServerProcess = null;
      mcpServerStartTime = null;
    });

    mcpServerProcess.on('exit', (code: number) => {
      console.log(`MCP Server process exited with code ${code}`);
      mcpServerProcess = null;
      mcpServerStartTime = null;
    });

    mcpServerStartTime = Date.now();
    console.log(`MCP Server started on ${config.host}:${config.port}`);
    return true;
  } catch (error) {
    console.error('Failed to start MCP Server:', error);
    return false;
  }
}

export async function stopMCPServer(): Promise<boolean> {
  if (!mcpServerProcess) {
    console.log('MCP Server is not running');
    return true;
  }

  try {
    mcpServerProcess.kill('SIGTERM');
    
    // Wait for process to exit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (mcpServerProcess && mcpServerProcess.exitCode === null) {
      mcpServerProcess.kill('SIGKILL');
    }
    
    mcpServerProcess = null;
    mcpServerStartTime = null;
    console.log('MCP Server stopped');
    return true;
  } catch (error) {
    console.error('Failed to stop MCP Server:', error);
    return false;
  }
}

export function getMCPServerStatus(): MCPServerStatus {
  const config = mcpRepo.getMCPConfig();
  
  return {
    running: !!mcpServerStartTime,
    port: config.port,
    host: config.host,
    uptime: mcpServerStartTime ? Date.now() - mcpServerStartTime : undefined
  };
}

// IPC Handlers
ipcMain.handle('mcp:get-config', () => {
  try {
    const config = mcpRepo.getMCPConfig();
    return success(config);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Failed to get MCP config');
  }
});

ipcMain.handle('mcp:update-config', (_, payload: UpdateMCPConfigPayload) => {
  try {
    const config = mcpRepo.updateMCPConfig(payload);
    return success(config);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Failed to update MCP config');
  }
});

ipcMain.handle('mcp:start-server', async () => {
  try {
    const success_flag = await startMCPServer();
    if (success_flag) {
      return success({ running: true });
    } else {
      return failure('Failed to start MCP server');
    }
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Failed to start MCP server');
  }
});

ipcMain.handle('mcp:stop-server', async () => {
  try {
    const success_flag = await stopMCPServer();
    if (success_flag) {
      return success({ running: false });
    } else {
      return failure('Failed to stop MCP server');
    }
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Failed to stop MCP server');
  }
});

ipcMain.handle('mcp:get-status', () => {
  try {
    const status = getMCPServerStatus();
    return success(status);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Failed to get MCP status');
  }
});
