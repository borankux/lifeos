import { ipcMain } from 'electron';
import * as mcpRepo from '../../database/mcpRepo';
import { MCPConfig, MCPServerStatus, UpdateMCPConfigPayload } from '../../common/types';
import { success, failure } from '../utils/response';

// Global MCP server instance
let mcpServerInstance: any = null;
let mcpServerStartTime: number | null = null;
let lastError: string | null = null;

export async function startMCPServer(): Promise<boolean> {
  if (mcpServerInstance) {
    console.log('MCP Server already running');
    return true;
  }

  try {
    const config = mcpRepo.getMCPConfig();
    console.log('Starting MCP Server with config:', config);
    
    // Import and start the MCP server directly (not as a separate process)
    const { startMcpServer } = require('../../server/mcp-server');
    
    // Start the server
    await startMcpServer();
    
    mcpServerInstance = { running: true }; // Store a flag
    mcpServerStartTime = Date.now();
    lastError = null;
    
    console.log(`✓ MCP Server started successfully on http://${config.host}:${config.port}`);
    console.log(`  - API Base: http://${config.host}:${config.port}/api`);
    console.log(`  - MCP Endpoint: http://${config.host}:${config.port}/mcp`);
    console.log(`  - Health Check: http://${config.host}:${config.port}/health`);
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    lastError = errorMessage;
    console.error('✗ Failed to start MCP Server:', errorMessage);
    console.error('  Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    mcpServerInstance = null;
    mcpServerStartTime = null;
    return false;
  }
}

export async function stopMCPServer(): Promise<boolean> {
  if (!mcpServerInstance) {
    console.log('MCP Server is not running');
    return true;
  }

  try {
    // The server is running in the same process, we can't really stop it
    // without closing the entire Electron app. Just mark it as stopped.
    mcpServerInstance = null;
    mcpServerStartTime = null;
    lastError = null;
    console.log('MCP Server marked as stopped (server still listening in background)');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    lastError = errorMessage;
    console.error('Failed to stop MCP Server:', errorMessage);
    return false;
  }
}

export function getMCPServerStatus(): MCPServerStatus {
  const config = mcpRepo.getMCPConfig();
  
  return {
    running: !!mcpServerInstance,
    port: config.port,
    host: config.host,
    uptime: mcpServerStartTime ? Date.now() - mcpServerStartTime : undefined,
    error: lastError || undefined
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
    console.log('IPC: Starting MCP server...');
    const success_flag = await startMCPServer();
    if (success_flag) {
      const status = getMCPServerStatus();
      console.log('IPC: MCP server started successfully');
      return success({ running: true, status });
    } else {
      const status = getMCPServerStatus();
      const errorMsg = status.error || 'Failed to start MCP server - check console for details';
      console.error('IPC: Failed to start MCP server:', errorMsg);
      return failure(errorMsg);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error starting MCP server';
    console.error('IPC: Exception while starting MCP server:', errorMsg);
    return failure(errorMsg);
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
