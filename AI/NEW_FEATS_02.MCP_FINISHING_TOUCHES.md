# Feature 02: MCP Streamable HTTP & Legacy SSE Endpoints

## Overview
Extend the existing MCP server to be **fully compliant with the Model Context Protocol specification (2025-06-18)** by implementing JSON-RPC 2.0 endpoints that bridge Claude Desktop (and other MCP clients) to the LifeOS REST API.

---

## Current State Analysis

### ✅ What Exists
1. **REST API Foundation**
   - `/api/tasks`, `/api/projects`, `/api/habits`, `/api/notebooks`, `/api/notes`, `/api/qa`, `/api/activities`, `/api/settings`, `/api/status`, `/api/logs`
   - All routes fully functional with middleware (auth, rate limiting, logging)
   - Controllers and repositories ready

2. **Server Infrastructure**
   - Express.js app with CORS, JSON parsing, middleware stack
   - Health check at `/health`
   - Middleware: auth, rate limiting, request logging, error handling
   - Database initialization integrated

3. **Manifest & Tool Definitions**
   - `mcp-manifest.json` with 14 tools defined (get_tasks, create_task, update_task, etc.)
   - Resource URIs for tasks, projects, habits, notebooks, Q&A, activities
   - Proper permissions configuration

### ❌ What's Missing

| Component | Required by Spec | Current Status | Impact |
|---|---|---|---|
| **POST /mcp (JSON-RPC 2.0)** | CRITICAL | Missing | Claude Desktop can't call tools via JSON-RPC |
| **GET /mcp (SSE stream)** | Recommended | Missing | Modern streamable HTTP clients can't receive server notifications |
| **GET /sse (legacy)** | Optional but recommended | Missing | Older MCP clients unsupported |
| **POST /messages (legacy)** | Optional but recommended | Missing | Legacy client compatibility broken |
| **MCP-Protocol-Version header** | REQUIRED | Missing | Clients won't know protocol compliance |
| **Mcp-Session-Id support** | REQUIRED | Missing | Stateful sessions not supported |
| **DELETE /mcp** | REQUIRED | Missing | Session cleanup unavailable |
| **Origin validation** | REQUIRED (security) | Partial (CORS only) | MCP-specific security gap |
| **/healthz endpoint** | Recommended | `/health` exists | Non-standard path |
| **JSON-RPC method routing** | CRITICAL | Missing | No bridge between RPC and REST APIs |

---

## What Needs to Be Done

### Phase 1: JSON-RPC 2.0 Core Infrastructure

#### 1.1 Create JSON-RPC Message Types & Router
- **File**: `src/server/utils/jsonRpc.ts` (NEW)
- **Purpose**: Parse, validate, and route JSON-RPC 2.0 messages
- **Responsibilities**:
  - Define TypeScript interfaces for JSON-RPC requests/responses/errors
  - Implement RPC validator (must check `jsonrpc: "2.0"`, `method`, `params`, `id`)
  - Create error handler following JSON-RPC error codes (-32600, -32601, -32602, -32700, etc.)
  - Provide utility to format responses and errors

#### 1.2 Create MCP Tool Handler Adapter
- **File**: `src/server/utils/toolHandlers.ts` (NEW)
- **Purpose**: Map JSON-RPC method calls to existing REST endpoints
- **Responsibilities**:
  - Define adapter for each tool (get_tasks, create_task, update_task, get_projects, etc.)
  - Call appropriate controller methods or HTTP client to internal `/api/*` routes
  - Transform RPC params into REST request format
  - Transform REST response back to RPC result
  - Handle errors and timeouts

**Example mapping**:
```
RPC Method: "get_tasks"
RPC Params: { status: "pending", limit: 50 }
  ↓
HTTP: GET /api/tasks?status=pending&limit=50
  ↓
RPC Response: { jsonrpc: "2.0", result: [...], id: 1 }
```

#### 1.3 Create SSE Manager for Streaming
- **File**: `src/server/utils/sseManager.ts` (NEW)
- **Purpose**: Handle Server-Sent Events for notifications and background streams
- **Responsibilities**:
  - Maintain active SSE connections (session tracking)
  - Send heartbeats to keep connections alive
  - Support `Last-Event-ID` for resumability
  - Queue messages if client reconnects
  - Cleanup disconnected sessions

### Phase 2: MCP Endpoint Implementation

#### 2.1 POST /mcp Endpoint
- **File**: `src/server/routes/mcp.ts` (NEW)
- **Purpose**: Handle JSON-RPC 2.0 requests from clients
- **Behavior**:
  - Accept `Content-Type: application/json`
  - Parse JSON-RPC request from body
  - Validate `MCP-Protocol-Version` header (e.g., `2025-06-18`)
  - Handle `Mcp-Session-Id` header for stateful sessions
  - Route method to appropriate handler (via toolHandlers)
  - Support optional `Accept: text/event-stream` for streaming responses
  - Return `202 Accepted` for notifications (no response expected)
  - Return full JSON-RPC response for requests
  - If streaming needed, switch to SSE format

**Key headers to handle**:
- `Accept: application/json, text/event-stream` (client preferences)
- `MCP-Protocol-Version: 2025-06-18` (validate and echo)
- `Mcp-Session-Id: <uuid>` (optional, track stateful sessions)
- `Origin` (validate against whitelist for security)

#### 2.2 GET /mcp Endpoint (SSE Stream)
- **File**: Same `src/server/routes/mcp.ts`
- **Purpose**: Optional background SSE stream for server-initiated messages
- **Behavior**:
  - Check `Accept: text/event-stream` header
  - Return `405 Method Not Allowed` if client doesn't support SSE
  - Open persistent SSE connection
  - Send periodic heartbeat events (e.g., every 30 seconds)
  - Support `Mcp-Session-Id` for resumability
  - Support `Last-Event-ID` query param for reconnection
  - Stream any server-initiated requests or notifications

#### 2.3 GET /sse Endpoint (Legacy Discovery)
- **File**: `src/server/routes/sse.ts` (NEW)
- **Purpose**: Help legacy MCP clients discover the POST endpoint
- **Behavior**:
  - Return `Content-Type: text/event-stream`
  - First event: `event: endpoint` with data `{"url": "http://localhost:3000/messages"}`
  - Keep connection open for backward compatibility

#### 2.4 POST /messages Endpoint (Legacy RPC)
- **File**: `src/server/routes/messages.ts` (NEW)
- **Purpose**: Accept JSON-RPC requests from older MCP clients
- **Behavior**:
  - Accept `Content-Type: application/json`
  - Parse JSON-RPC request
  - Route to same handler as `/mcp`
  - Return JSON-RPC response

#### 2.5 DELETE /mcp Endpoint (Session Cleanup)
- **File**: Same `src/server/routes/mcp.ts`
- **Purpose**: Allow clients to explicitly end sessions
- **Behavior**:
  - Accept `Mcp-Session-Id` header
  - Remove session from tracking
  - Close any open SSE streams for that session
  - Return `200 OK` or `404 Not Found`

#### 2.6 GET /healthz Endpoint
- **File**: Update `src/server/mcp-server.ts`
- **Purpose**: Standard health check matching spec
- **Response**: 
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 12345
}
```

### Phase 3: Security & Validation

#### 3.1 Origin Validation Middleware
- **File**: Update `src/server/middleware/auth.ts` or create `src/server/middleware/mcp-security.ts`
- **Purpose**: Validate `Origin` header for MCP requests
- **Behavior**:
  - Whitelist `localhost`, `127.0.0.1`, `localhost:3000`, `127.0.0.1:3000`
  - Reject requests from unexpected origins (DNS rebinding defense)
  - Log rejected origins for security monitoring

#### 3.2 MCP-Protocol-Version Validation
- **File**: `src/server/middleware/mcp-security.ts` (NEW)
- **Purpose**: Ensure client and server agree on protocol version
- **Behavior**:
  - Accept header: `MCP-Protocol-Version: 2025-06-18`
  - Return 400 Bad Request if missing or mismatched
  - Echo version in response headers

#### 3.3 Input Validation for RPC
- **File**: `src/server/utils/jsonRpc.ts`
- **Purpose**: Validate JSON-RPC message structure
- **Validation Rules**:
  - `jsonrpc` must be `"2.0"`
  - `method` must be a string and exist in supported tools
  - `params` must be object (if provided)
  - `id` must be string or number (for requests, not notifications)
  - Prevent SQL injection via params validation

### Phase 4: Integration & Configuration

#### 4.1 Register Routes in Main Server
- **File**: `src/server/mcp-server.ts`
- **Actions**:
  - Import new route files (mcp, sse, messages)
  - Add `app.use('/mcp', mcpRouter)` and mount others
  - Register MCP security middleware
  - Update CORS to explicitly allow MCP transports

#### 4.2 Configuration Storage (Optional but Recommended)
- **File**: `src/database/mcpRepo.ts` (if not exists, create)
- **Purpose**: Store MCP server settings in database
- **Fields**:
  - `port`: 3000 (default)
  - `host`: "127.0.0.1" (default)
  - `enabled`: true
  - `autoStart`: true
  - `protocolVersion`: "2025-06-18"
  - `sessionTimeout`: 3600 (seconds)
- **Note**: Allows UI to toggle MCP on/off, change port, etc.

#### 4.3 Update Client Configuration Generator
- **File**: Create `src/server/utils/configGenerator.ts` (NEW)
- **Purpose**: Generate client config JSON for Claude Desktop and others
- **Output**: JSON with both Streamable HTTP and legacy SSE endpoints
```json
{
  "name": "lifeos",
  "description": "Local LifeOS MCP server (kanban, habits, logs, notebooks, Q&A)",
  "endpoints": {
    "streamableHttp": "http://localhost:3000/mcp",
    "sseLegacy": "http://localhost:3000/sse",
    "postLegacy": "http://localhost:3000/messages"
  },
  "protocol": "2025-06-18",
  "notes": "Prefer Streamable HTTP. SSE+POST kept for older clients."
}
```

---

## Implementation Order

1. **Create JSON-RPC utilities** (`jsonRpc.ts`, `toolHandlers.ts`, `sseManager.ts`)
2. **Create MCP routes** (`mcp.ts`, `sse.ts`, `messages.ts`)
3. **Create security middleware** (`mcp-security.ts`)
4. **Integrate into main server** (update `mcp-server.ts`)
5. **Create config generator** (`configGenerator.ts`)
6. **Test all transports** (POST /mcp, GET /mcp SSE, legacy routes)
7. **Validate headers** (MCP-Protocol-Version, Mcp-Session-Id, Origin)
8. **Verify Claude Desktop integration** (test with real client if available)

---

## Acceptance Criteria

- [ ] `POST /mcp` accepts JSON-RPC 2.0 requests and routes to correct tool handlers
- [ ] `GET /mcp` opens SSE stream with heartbeats and supports Last-Event-ID
- [ ] `GET /sse` returns endpoint discovery event
- [ ] `POST /messages` handles legacy JSON-RPC requests
- [ ] `DELETE /mcp` properly closes sessions
- [ ] `GET /healthz` returns proper status with version/uptime
- [ ] All MCP headers validated (`MCP-Protocol-Version`, `Mcp-Session-Id`, `Origin`)
- [ ] Rate limiting applies to MCP endpoints (100 req/min)
- [ ] Auth middleware protects MCP endpoints (if configured)
- [ ] CORS allows MCP transports
- [ ] Config generator creates valid client JSON
- [ ] Claude Desktop can connect via `http://localhost:3000/mcp` (Streamable HTTP)
- [ ] Legacy clients can use `http://localhost:3000/sse` path
- [ ] Tool calls execute correctly (e.g., `get_tasks` returns task list)
- [ ] Error handling follows JSON-RPC 2.0 spec
- [ ] Sessions timeout and cleanup properly

---

## File Structure Summary

```
src/server/
├── mcp-server.ts (MODIFIED - register routes, update CORS)
├── routes/
│   ├── mcp.ts (NEW - POST/GET/DELETE /mcp)
│   ├── sse.ts (NEW - GET /sse legacy discovery)
│   ├── messages.ts (NEW - POST /messages legacy RPC)
│   └── ... (existing routes unchanged)
├── middleware/
│   ├── mcp-security.ts (NEW - Origin, Protocol-Version validation)
│   └── ... (existing middleware unchanged)
└── utils/
    ├── jsonRpc.ts (NEW - JSON-RPC parser, validator, formatter)
    ├── toolHandlers.ts (NEW - RPC method → REST adapter)
    ├── sseManager.ts (NEW - SSE connection + session management)
    └── configGenerator.ts (NEW - Client config JSON generator)
```

---

## Notes

- **Backward Compatibility**: All existing REST endpoints (`/api/*`) remain unchanged; MCP endpoints are purely additive
- **Security**: Bind to `127.0.0.1` by default (localhost only); validate `Origin` header to prevent DNS rebinding
- **Performance**: SSE heartbeats keep connections alive; tool handlers reuse existing REST logic (no duplication)
- **Extensibility**: Tool handlers can easily map new tools as more features are added to LifeOS
- **Testing**: Can validate with curl, Postman, Claude Desktop, or any MCP 2.0 client
