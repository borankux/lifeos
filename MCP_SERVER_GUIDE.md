# MCP Server Guide

## What is the MCP Server?

The **MCP Server** in LifeOS is a **REST API web service** that runs locally on your machine. It provides two ways to connect:

1. **Native SSE Transport** (Recommended) - Modern MCP clients connect directly via HTTP/SSE
2. **Legacy Bridge Transport** - Older clients use `mcp-remote` to translate stdio to HTTP

## How It Works

### Native SSE Transport (Recommended)

```
┌─────────────────────┐
│  Modern MCP Client  │
│  (Claude Desktop,   │
│   Cursor, Windsurf) │
└──────────┬──────────┘
           │
           │ Direct HTTP/SSE
           ▼
┌─────────────────────┐
│  LifeOS MCP Server  │
│  Port: 3000         │
│  ├─ /sse (GET)      │
│  └─ /mcp (POST)     │
└─────────────────────┘
```

### Legacy Bridge Transport (Fallback)

```
┌─────────────────────┐
│  Legacy MCP Client  │
│  (Older Claude,     │
│   Basic Cline)      │
└──────────┬──────────┘
           │
           │ stdio (JSON-RPC)
           ▼
┌─────────────────────┐
│  mcp-remote bridge  │
│  (Auto-installed)   │
└──────────┬──────────┘
           │
           │ HTTP POST
           ▼
┌─────────────────────┐
│  LifeOS MCP Server  │
│  Port: 3000         │
│  └─ /mcp (POST)     │
└─────────────────────┘
```

## Server Information

- **Type**: HTTP REST API Web Service
- **Framework**: Express.js (Node.js)
- **Default Host**: `localhost` (127.0.0.1)
- **Default Port**: `3000`
- **Base URL**: `http://localhost:3000`

## API Endpoints

### Health Check
```bash
GET http://localhost:3000/health
```

### MCP Protocol Endpoints

- **SSE Streaming**: `GET http://localhost:3000/sse` - Server-Sent Events for real-time updates
- **JSON-RPC**: `POST http://localhost:3000/mcp` - Tool execution endpoint
- **Legacy Messages**: `POST http://localhost:3000/messages` - Backward compatibility

### REST API Endpoints

All API endpoints require authentication (handled internally by the Electron app).

- **Tasks**: `http://localhost:3000/api/tasks`
- **Projects**: `http://localhost:3000/api/projects`
- **Habits**: `http://localhost:3000/api/habits`
- **Notebooks**: `http://localhost:3000/api/notebooks`
- **Notes**: `http://localhost:3000/api/notes`
- **Q&A**: `http://localhost:3000/api/qa`
- **Activities**: `http://localhost:3000/api/activities`
- **Settings**: `http://localhost:3000/api/settings`

## Connecting MCP Clients

### Quick Setup Guide

1. **Start LifeOS** and go to **Settings → MCP Server**
2. Click **"Start Server"** (or enable auto-start)
3. Click **"🔧 Configure Client"** button
4. **Select your transport type**:
   - **Native SSE** (recommended for modern clients)
   - **Legacy Bridge** (for older clients)
5. **Select your client** from the dropdown
6. **Copy the generated configuration**
7. **Paste into your client's config file**
8. **Restart your client**

### Supported Clients

#### Modern Clients (Native SSE Transport)

✅ **Claude Desktop (Latest)**
- Config file: `%AppData%\Claude\config.json` (Windows) or `~/Library/Application Support/Claude/config.json` (macOS)
- Direct HTTP/SSE connection
- No bridge needed

✅ **Cursor IDE**
- Config file: `.cursor/mcp.json`
- Native SSE support
- Fast and efficient

✅ **Windsurf**
- Config file: `windsurf.config.json`
- Built-in retry mechanism
- Production-ready

#### Legacy Clients (Bridge Transport)

🔗 **Older Claude Desktop Versions**
- Uses `mcp-remote` bridge
- Auto-installs via npx
- Config file: `%AppData%\Claude\config.json`

🔗 **Cline (VS Code)**
- Config file: `.vscode/settings.json`
- Requires `mcp-remote` bridge
- Works with stdio transport

## Configuration Examples

### Example 1: Claude Desktop (Native SSE)

**File**: `%AppData%\Claude\config.json` (Windows) or `~/Library/Application Support/Claude/config.json` (macOS)

```json
{
  "mcpServers": {
    "lifeos": {
      "transport": {
        "type": "sse",
        "sseUrl": "http://localhost:3000/sse",
        "postUrl": "http://localhost:3000/mcp",
        "heartbeatMs": 15000,
        "requestTimeoutMs": 30000
      },
      "metadata": {
        "name": "LifeOS",
        "version": "1.0.0",
        "description": "Personal life management system"
      },
      "capabilities": {
        "tools": true,
        "resources": true
      }
    }
  }
}
```

### Example 2: Cursor IDE (Native SSE)

**File**: `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "lifeos": {
      "transport": {
        "type": "sse",
        "sseUrl": "http://localhost:3000/sse",
        "postUrl": "http://localhost:3000/mcp"
      }
    }
  }
}
```

### Example 3: Windsurf (Native SSE)

**File**: `windsurf.config.json`

```json
{
  "mcpServers": {
    "lifeos": {
      "transport": {
        "type": "sse",
        "sseUrl": "http://localhost:3000/sse",
        "postUrl": "http://localhost:3000/mcp",
        "retry": {
          "maxAttempts": 3,
          "backoffMs": 2000
        }
      },
      "metadata": {
        "name": "LifeOS",
        "description": "Kanban, habits, notes, QA, activities tracking"
      },
      "capabilities": {
        "tools": true,
        "resources": true
      }
    }
  }
}
```

### Example 4: Older Claude Desktop (Legacy Bridge)

**File**: `%AppData%\Claude\config.json`

```json
{
  "mcpServers": {
    "lifeos": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:3000/mcp"
      ]
    }
  }
}
```

**Note**: `mcp-remote` will be automatically downloaded and installed by npx on first use.

### Example 5: Cline (Legacy Bridge)

**File**: `.vscode/settings.json`

```json
{
  "roo-cline.mcp.servers": {
    "lifeos": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:3000/mcp"
      ]
    }
  }
}
```

### Custom Port Configuration

If you changed the port to 8080:

**Native SSE:**
```json
{
  "mcpServers": {
    "lifeos": {
      "transport": {
        "type": "sse",
        "sseUrl": "http://localhost:8080/sse",
        "postUrl": "http://localhost:8080/mcp"
      }
    }
  }
}
```

**Legacy Bridge:**
```json
{
  "mcpServers": {
    "lifeos": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:8080/mcp"]
    }
  }
}
```

## How to Use

### 1. **Start the Server** (from within LifeOS app)

Go to **Settings → MCP Server** and click **"Start Server"**

### 2. **Test the Server**

Open your browser or terminal and test:

```bash
# Using cURL
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"2025-10-28T...","uptime":123,"version":"1.0.0"}
```

### 3. **Access from External Tools**

You can now use any HTTP client to interact with your LifeOS data:

**Example with cURL:**
```bash
# Get health status
curl http://localhost:3000/health

# Get all projects (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/projects
```

**Example with Postman:**
1. Create a new request
2. Set URL to `http://localhost:3000/health`
3. Send the request

**Example with JavaScript/fetch:**
```javascript
fetch('http://localhost:3000/health')
  .then(res => res.json())
  .then(data => console.log(data));
```

## Configuration

### Change Port

1. Go to **Settings → MCP Server**
2. Click **Edit** next to the port number
3. Enter a new port (e.g., 3001, 8080)
4. Click **Save**
5. Restart the server

### Enable Auto-Start

1. Go to **Settings → MCP Server**
2. Toggle **Auto-start** to **Enabled**
3. The server will now start automatically when you launch LifeOS

## Common Issues

### Server Issues

#### ❌ "Port already in use"
**Solution**: Change the port in Settings to a different number (e.g., 3001, 8080, 5000)

#### ❌ "Server not starting"
**Check**:
1. Look at the server logs in Settings → MCP Server
2. Check the Electron console (DevTools) for error messages
3. Ensure no other application is using the same port

#### ❌ "Cannot connect from browser"
**Check**:
1. Is the server running? (Check status indicator in Settings)
2. Are you using the correct URL? (`http://localhost:3000`)
3. Is your firewall blocking the connection?

### MCP Client Issues

#### ❌ "Claude Desktop not connecting"
**Solutions**:
1. **Check server is running**: Go to LifeOS Settings → MCP Server, verify green status
2. **Test connection**: Click "Test Connection" button
3. **Verify config file location**:
   - Windows: `%AppData%\Claude\config.json`
   - macOS: `~/Library/Application Support/Claude/config.json`
4. **Check JSON syntax**: Make sure the config is valid JSON
5. **Restart Claude Desktop** after config changes
6. **Try legacy bridge** if native SSE fails:
   ```json
   {
     "mcpServers": {
       "lifeos": {
         "command": "npx",
         "args": ["-y", "mcp-remote", "http://localhost:3000/mcp"]
       }
     }
   }
   ```

#### ❌ "Cursor IDE can't find MCP server"
**Solutions**:
1. Check `.cursor/mcp.json` exists in workspace or user config directory
2. Verify LifeOS server is running
3. Check port matches config (default: 3000)
4. Reload Cursor window after config changes

#### ❌ "Cline 'Server failed to start' error"
**Solutions**:
1. Ensure `mcp-remote` can be installed (check npm/npx)
2. Verify LifeOS server is running first
3. Check `.vscode/settings.json` syntax
4. Look at VS Code Developer Console for errors

#### ❌ "mcp-remote not installing"
**Solutions**:
1. Check internet connection (npx downloads from npm registry)
2. Try manual installation: `npm install -g mcp-remote`
3. Clear npx cache: `npx clear-npx-cache` then retry
4. Check Node.js version (requires Node 14+)

#### ❌ "Protocol version mismatch"
**Solution**: This has been fixed - LifeOS now accepts requests with or without protocol version header. Update to latest version.

#### ❌ "Connection times out"
**Check**:
1. Firewall isn't blocking localhost connections
2. Server logs for errors (Settings → MCP Server → Server Logs)
3. Try restarting both LifeOS and the MCP client
4. Verify correct port in both server settings and client config

## NOT a Standalone Script

⚠️ **Important**: The MCP server is **NOT** meant to be run as a standalone Node.js script like:

```bash
# ❌ DON'T DO THIS
node server/mcp-server.js
```

Instead, it's **embedded inside the Electron app** and managed through the Settings UI:

```
Settings → MCP Server → [Start Server] button
```

## Architecture

```
Electron Main Process
  ├── Database (SQLite)
  ├── IPC Handlers
  └── MCP Server (Express.js)
       ├── Listens on localhost:3000
       ├── Shares same database connection
       └── Responds to HTTP requests
```

## For Developers

If you want to integrate with LifeOS from external tools (Python scripts, AI agents, other apps):

1. **Start LifeOS application**
2. **Enable & Start MCP Server** in Settings
3. **Use HTTP requests** to interact with the API
4. **Example in Python**:
   ```python
   import requests
   
   response = requests.get('http://localhost:3000/health')
   print(response.json())
   ```

## Testing Your MCP Setup

### Test 1: Server Health Check

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-28T12:34:56.789Z",
  "uptime": 123,
  "version": "1.0.0"
}
```

### Test 2: SSE Endpoint

```bash
curl -N -H "Accept: text/event-stream" http://localhost:3000/sse
```

**Expected**: SSE stream opens with session ID

### Test 3: JSON-RPC Request

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "get_tasks",
    "params": {"status": "pending"},
    "id": 1
  }'
```

**Expected**: JSON-RPC response with task data

### Test 4: From MCP Client

After configuring your MCP client:

1. **Restart the client**
2. **Ask the AI**: "Show me my pending tasks from LifeOS"
3. **Expected**: AI should retrieve and display your tasks

### Test 5: UI Connection Test

1. Go to **Settings → MCP Server**
2. Click **"🔌 Test Connection"** button
3. **Expected**: Green success message with server uptime

## Summary

- ✅ **Two Transport Options**: Native SSE (modern) or Legacy Bridge (older clients)
- ✅ **Easy Configuration**: Use LifeOS Settings UI to generate config snippets
- ✅ **Multiple Clients Supported**: Claude, Cursor, Windsurf, Cline, and more
- ✅ **HTTP Access**: Also works with cURL, Postman, fetch, or any HTTP client
- ✅ **Auto-Start**: Server can start automatically with LifeOS
- ✅ **Built-in Testing**: Connection test button and server logs
- ❌ **NOT a standalone script**: Runs inside Electron app, managed via Settings UI

---

**Need help?** 
- Check logs: Settings → MCP Server → Server Logs
- Test connection: Settings → MCP Server → Test Connection
- Verify config: Settings → MCP Server → Configure Client

**Recommended Setup:**
1. Enable auto-start in Settings
2. Use Native SSE transport (better performance)
3. Configure your MCP client with generated config
4. Test connection before first use
