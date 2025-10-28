# Server Lifecycle Management

<cite>
**Referenced Files in This Document**
- [mcp-server.ts](file://src/server/mcp-server.ts)
- [index.ts](file://src/main/index.ts)
- [mcp.ts](file://src/main/ipc/mcp.ts)
- [types.ts](file://src/common/types.ts)
- [mcpRepo.ts](file://src/database/mcpRepo.ts)
- [init.ts](file://src/database/init.ts)
- [preload/index.ts](file://src/preload/index.ts)
- [MCPStatusIndicator.tsx](file://src/renderer/components/MCPStatusIndicator.tsx)
- [SettingsPage.tsx](file://src/renderer/pages/SettingsPage.tsx)
- [devRunner.ts](file://src/main/devRunner.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Dual Execution Modes](#dual-execution-modes)
3. [Core Factory Functions](#core-factory-functions)
4. [Standalone Server Mode](#standalone-server-mode)
5. [Integrated Electron Mode](#integrated-electron-mode)
6. [Configuration Management](#configuration-management)
7. [Lifecycle Control](#lifecycle-control)
8. [Error Handling Strategies](#error-handling-strategies)
9. [Graceful Shutdown Procedures](#graceful-shutdown-procedures)
10. [Integration Examples](#integration-examples)
11. [Monitoring and Status](#monitoring-and-status)
12. [Troubleshooting Guide](#troubleshooting-guide)

## Introduction

The MCP (Model Context Protocol) Server in LifeOS operates under a sophisticated dual execution model that allows it to function both as a standalone Express.js server and as an integrated component within the Electron main process. This flexible architecture enables developers to choose the most appropriate deployment strategy based on their specific requirements while maintaining consistent functionality across both modes.

The server lifecycle management encompasses several critical aspects: factory function-based initialization, conditional startup logic, comprehensive error handling, graceful shutdown procedures, and seamless integration with the Electron ecosystem. This documentation provides a complete guide to understanding and implementing these lifecycle management capabilities.

## Dual Execution Modes

### Standalone Process Mode

In standalone mode, the MCP server operates independently as a Node.js process, providing maximum isolation and flexibility. This mode is ideal for development environments, testing scenarios, and production deployments where the server needs to be managed separately from the main application.

```mermaid
flowchart TD
Start([Application Start]) --> CheckMode{"Execution Mode?"}
CheckMode --> |Direct Run| StandaloneMode["Standalone Mode"]
CheckMode --> |Electron Integration| ElectronMode["Electron Integrated Mode"]
StandaloneMode --> InitDB["Initialize Database"]
InitDB --> CreateServer["Create Express Server"]
CreateServer --> StartServer["Start Server on Port"]
StartServer --> HealthCheck["Health Check Endpoint"]
HealthCheck --> Ready["Server Ready"]
Ready --> Monitor["Monitor Server"]
Monitor --> GracefulShutdown["Graceful Shutdown"]
```

**Diagram sources**
- [mcp-server.ts](file://src/server/mcp-server.ts#L80-L89)

### Integrated Electron Mode

The integrated mode embeds the MCP server within the Electron main process, enabling tight integration with the application's lifecycle management. This mode provides automatic startup, shutdown coordination, and seamless communication between the server and the main application.

```mermaid
sequenceDiagram
participant Main as "Electron Main Process"
participant IPC as "IPC Handler"
participant Server as "MCP Server"
participant DB as "Database"
Main->>DB : Initialize Database
DB-->>Main : Database Ready
Main->>IPC : Register IPC Handlers
IPC-->>Main : Handlers Registered
Main->>IPC : Check MCP Config
IPC-->>Main : Config Retrieved
Main->>Server : Start MCP Server
Server->>DB : Connect to Database
DB-->>Server : Connection Established
Server-->>Main : Server Started
Main->>Main : Application Ready
```

**Diagram sources**
- [index.ts](file://src/main/index.ts#L60-L95)
- [mcp.ts](file://src/main/ipc/mcp.ts#L10-L50)

**Section sources**
- [mcp-server.ts](file://src/server/mcp-server.ts#L80-L89)
- [index.ts](file://src/main/index.ts#L60-L95)

## Core Factory Functions

### createMcpServer() Factory Function

The `createMcpServer()` function serves as the primary factory for constructing the MCP server instance. This function encapsulates all server configuration, middleware setup, route registration, and error handling logic.

```mermaid
classDiagram
class McpServerFactory {
+createMcpServer() Express.Application
+configureMiddleware() void
+registerRoutes() void
+setupErrorHandling() void
}
class ExpressApp {
+use(middleware) void
+get(path, handler) void
+post(path, handler) void
+listen(port, callback) void
}
class MiddlewareStack {
+cors() CORS
+json() JSONParser
+logging() Logger
+rateLimit() RateLimiter
+auth() AuthMiddleware
}
class RouteRegistry {
+tasksRouter TasksRouter
+projectsRouter ProjectsRouter
+habitsRouter HabitsRouter
+notebooksRouter NotebooksRouter
+qaRouter QARouter
+activitiesRouter ActivitiesRouter
+settingsRouter SettingsRouter
+statusRouter StatusRouter
}
McpServerFactory --> ExpressApp : creates
ExpressApp --> MiddlewareStack : uses
ExpressApp --> RouteRegistry : registers
```

**Diagram sources**
- [mcp-server.ts](file://src/server/mcp-server.ts#L15-L50)

The factory function implements a comprehensive middleware stack including CORS configuration, JSON parsing, request logging, rate limiting, and authentication middleware. It also establishes health check endpoints and registers all API routes for different functional domains.

**Section sources**
- [mcp-server.ts](file://src/server/mcp-server.ts#L15-L50)

### startMcpServer() Startup Function

The `startMcpServer()` function orchestrates the complete server startup process with proper error handling and promise-based return patterns. This function ensures that all prerequisites are met before attempting to start the server.

```mermaid
flowchart TD
Start([startMcpServer Called]) --> InitDB["Initialize Database"]
InitDB --> DBSuccess{"Database Init Success?"}
DBSuccess --> |No| DBOperation["Log Error & Throw"]
DBSuccess --> |Yes| CreateExpress["Create Express Server"]
CreateExpress --> SetupPromise["Setup Promise-Based Return"]
SetupPromise --> Listen["Listen on Configured Port"]
Listen --> ListenSuccess{"Listen Success?"}
ListenSuccess --> |No| ListenError["Log Error & Reject"]
ListenSuccess --> |Yes| LogSuccess["Log Success & Resolve"]
DBOperation --> End([Throw Error])
ListenError --> End
LogSuccess --> End([Resolve Successfully])
```

**Diagram sources**
- [mcp-server.ts](file://src/server/mcp-server.ts#L52-L78)

The startup function follows a strict sequence: database initialization, server creation, and network binding. Each step includes comprehensive error logging and appropriate rejection patterns for promise-based error handling.

**Section sources**
- [mcp-server.ts](file://src/server/mcp-server.ts#L52-L78)

## Standalone Server Mode

### Direct Module Execution

The standalone server mode is activated when the module is executed directly via Node.js. This mode includes automatic startup logic that initializes the server and handles any startup failures gracefully.

```mermaid
sequenceDiagram
participant CLI as "Command Line"
participant Module as "mcp-server.ts"
participant Server as "Express Server"
participant Logger as "Logger"
CLI->>Module : node mcp-server.js
Module->>Module : Check require.main === module
Module->>Server : startMcpServer()
Server->>Server : initDatabase()
Server->>Server : createMcpServer()
Server->>Server : app.listen()
Server-->>Module : Success/Failure
Module->>Logger : Log Result
Module->>CLI : Exit Code (0/1)
```

**Diagram sources**
- [mcp-server.ts](file://src/server/mcp-server.ts#L80-L89)

### Environment Configuration

The standalone mode respects environment variables for server configuration, allowing flexible deployment across different environments without code changes.

| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| `MCP_SERVER_PORT` | 3000 | Server listening port |
| `MCP_SERVER_HOST` | localhost | Server bind address |
| `MCP_CORS_ORIGIN` | * | CORS allowed origins |

**Section sources**
- [mcp-server.ts](file://src/server/mcp-server.ts#L13-L14)
- [mcp-server.ts](file://src/server/mcp-server.ts#L80-L89)

## Integrated Electron Mode

### Electron Main Process Integration

The integrated mode seamlessly integrates the MCP server within the Electron main process, providing automatic startup coordination and lifecycle management.

```mermaid
classDiagram
class ElectronMainProcess {
+registerIpcHandlers() void
+createMainWindow() Promise~void~
+initializeDatabase() Promise~boolean~
+startMcpServer() Promise~void~
}
class MCPIPCModule {
+startMCPServer() Promise~boolean~
+stopMCPServer() Promise~boolean~
+getMCPServerStatus() MCPServerStatus
}
class MCPConfig {
+enabled boolean
+autoStart boolean
+port number
+host string
}
class ChildProcess {
+spawn(command, args) ChildProcess
+kill(signal) void
+on(event, callback) void
}
ElectronMainProcess --> MCPIPCModule : uses
MCPIPCModule --> MCPConfig : reads
MCPIPCModule --> ChildProcess : manages
```

**Diagram sources**
- [index.ts](file://src/main/index.ts#L60-L95)
- [mcp.ts](file://src/main/ipc/mcp.ts#L10-L50)

### Conditional Auto-Startup Logic

The Electron integration implements sophisticated conditional logic to determine when and how to start the MCP server automatically.

```mermaid
flowchart TD
AppReady["Application Ready"] --> CheckDev{"Development Mode?"}
CheckDev --> |Yes| SkipAutoStart["Skip Auto-Start<br/>(Better-SQLite3 Issues)"]
CheckDev --> |No| LoadConfig["Load MCP Configuration"]
LoadConfig --> ConfigExists{"Config Exists?"}
ConfigExists --> |No| SkipAutoStart
ConfigExists --> |Yes| CheckEnabled{"Server Enabled?"}
CheckEnabled --> |No| SkipAutoStart
CheckEnabled --> |Yes| CheckAutoStart{"Auto-Start Enabled?"}
CheckAutoStart --> |No| SkipAutoStart
CheckAutoStart --> |Yes| StartServer["Start MCP Server"]
StartServer --> Success{"Start Success?"}
Success --> |Yes| LogSuccess["Log Success"]
Success --> |No| LogFailure["Log Failure"]
SkipAutoStart --> End([Continue Application])
LogSuccess --> End
LogFailure --> End
```

**Diagram sources**
- [index.ts](file://src/main/index.ts#L80-L95)

**Section sources**
- [index.ts](file://src/main/index.ts#L60-L95)

## Configuration Management

### Database Schema and Initialization

The MCP server configuration is persisted in the application's SQLite database, ensuring that settings survive application restarts and provide a centralized configuration management system.

```mermaid
erDiagram
MCP_CONFIG {
integer id PK "Primary key constraint (id = 1)"
integer port "Server port (default: 3000)"
string host "Bind host (default: localhost)"
integer enabled "Server enabled flag (1/0)"
integer auto_start "Auto-start flag (1/0)"
datetime created_at "Creation timestamp"
datetime updated_at "Last update timestamp"
}
APPLICATION_STATE {
boolean database_available "Database availability flag"
string app_path "Application installation path"
boolean development_mode "Development mode flag"
}
MCP_CONFIG ||--|| APPLICATION_STATE : "configured by"
```

**Diagram sources**
- [init.ts](file://src/database/init.ts#L120-L135)
- [mcpRepo.ts](file://src/database/mcpRepo.ts#L4-L15)

### Configuration Repository Pattern

The configuration management follows a repository pattern that provides type-safe access to MCP server settings with automatic database persistence.

| Configuration Field | Type | Default | Description |
|--------------------|------|---------|-------------|
| `id` | number | 1 | Primary key constraint ensuring single configuration record |
| `port` | number | 3000 | TCP port for server binding |
| `host` | string | localhost | Network interface for server binding |
| `enabled` | boolean | true | Master switch for server operation |
| `autoStart` | boolean | true | Automatic startup on application launch |

**Section sources**
- [mcpRepo.ts](file://src/database/mcpRepo.ts#L4-L58)
- [init.ts](file://src/database/init.ts#L120-L135)

## Lifecycle Control

### Process-Based Server Management

The integrated Electron mode manages the MCP server as a separate child process, providing isolation and robust error recovery mechanisms.

```mermaid
stateDiagram-v2
[*] --> NotRunning
NotRunning --> Starting : startMCPServer()
Starting --> Running : Process Spawn Success
Starting --> Failed : Process Spawn Error
Running --> Stopping : stopMCPServer()
Running --> Error : Process Crash
Stopping --> NotRunning : Process Termination
Error --> NotRunning : Cleanup Complete
Failed --> NotRunning : Error Handled
Running : Process ID : 12345
Running : Uptime : 1h 23m 45s
Error : Error : EADDRINUSE
Failed : Error : Binary Not Found
```

**Diagram sources**
- [mcp.ts](file://src/main/ipc/mcp.ts#L10-L80)

### IPC Communication Layer

The IPC layer provides bidirectional communication between the Electron main process and the MCP server, enabling remote control and status monitoring.

```mermaid
sequenceDiagram
participant Renderer as "Renderer Process"
participant Preload as "Preload Script"
participant IPC as "IPC Channel"
participant Main as "Main Process"
participant Server as "MCP Server"
Renderer->>Preload : window.api.mcp.startServer()
Preload->>IPC : ipcRenderer.invoke('mcp : start-server')
IPC->>Main : ipcMain.handle('mcp : start-server')
Main->>Server : startMCPServer()
Server-->>Main : Success/Failure
Main-->>IPC : Response
IPC-->>Preload : ApiResponse
Preload-->>Renderer : Promise<Response>
```

**Diagram sources**
- [preload/index.ts](file://src/preload/index.ts#L180-L190)
- [mcp.ts](file://src/main/ipc/mcp.ts#L100-L120)

**Section sources**
- [mcp.ts](file://src/main/ipc/mcp.ts#L10-L80)
- [preload/index.ts](file://src/preload/index.ts#L180-L190)

## Error Handling Strategies

### Multi-Level Error Handling

The MCP server implements comprehensive error handling at multiple levels: database initialization, server startup, runtime operations, and process management.

```mermaid
flowchart TD
Operation["Server Operation"] --> Level1["Level 1: Database Layer"]
Level1 --> Level2["Level 2: Server Layer"]
Level2 --> Level3["Level 3: Process Layer"]
Level3 --> Level4["Level 4: Application Layer"]
Level1 --> DBError["Database Error<br/>- Connection Failed<br/>- Migration Error<br/>- Schema Issue"]
Level2 --> ServerError["Server Error<br/>- Port Binding<br/>- Middleware Error<br/>- Route Error"]
Level3 --> ProcessError["Process Error<br/>- Spawn Failed<br/>- Binary Not Found<br/>- Permission Denied"]
Level4 --> AppError["Application Error<br/>- IPC Failure<br/>- Configuration Error<br/>- Resource Exhaustion"]
DBError --> Recovery["Recovery Strategy"]
ServerError --> Recovery
ProcessError --> Recovery
AppError --> Recovery
Recovery --> Retry["Retry Logic"]
Recovery --> Fallback["Fallback Strategy"]
Recovery --> Graceful["Graceful Degradation"]
```

### Error Recovery Patterns

The system implements several error recovery patterns to ensure robust operation under various failure conditions.

| Error Category | Recovery Strategy | Implementation |
|---------------|------------------|----------------|
| Database Connection | Graceful degradation | Continue with limited functionality |
| Server Startup | Process restart | Automatic retry with exponential backoff |
| IPC Communication | Timeout handling | Fallback to polling status |
| Configuration | Default values | Use safe defaults for missing settings |

**Section sources**
- [mcp.ts](file://src/main/ipc/mcp.ts#L40-L50)
- [mcp-server.ts](file://src/server/mcp-server.ts#L52-L78)

## Graceful Shutdown Procedures

### Process Termination Management

The graceful shutdown procedure ensures clean termination of the MCP server process with proper resource cleanup and state preservation.

```mermaid
sequenceDiagram
participant User as "User Action"
participant Main as "Main Process"
participant Server as "MCP Server"
participant Resources as "System Resources"
User->>Main : Request Shutdown
Main->>Server : stopMCPServer()
Server->>Server : Send SIGTERM
Server->>Resources : Close Database Connections
Server->>Resources : Flush Buffers
Server->>Server : Wait for Completion
Server-->>Main : Termination Confirmed
Main->>Resources : Release System Resources
Main-->>User : Shutdown Complete
```

**Diagram sources**
- [mcp.ts](file://src/main/ipc/mcp.ts#L52-L80)

### Resource Cleanup Strategies

The shutdown process implements a comprehensive resource cleanup strategy to prevent resource leaks and ensure proper system state.

```mermaid
flowchart TD
ShutdownRequest["Shutdown Request"] --> StopServer["Stop MCP Server"]
StopServer --> SendSignal["Send SIGTERM Signal"]
SendSignal --> WaitTimeout["Wait 1 Second"]
WaitTimeout --> CheckExit{"Process Exited?"}
CheckExit --> |No| ForceKill["Force Kill with SIGKILL"]
CheckExit --> |Yes| CleanupResources["Cleanup Resources"]
ForceKill --> CleanupResources
CleanupResources --> ClearReferences["Clear Process References"]
ClearReferences --> ResetState["Reset Global State"]
ResetState --> LogCompletion["Log Shutdown Complete"]
LogCompletion --> End([Shutdown Complete])
```

**Diagram sources**
- [mcp.ts](file://src/main/ipc/mcp.ts#L52-L80)

**Section sources**
- [mcp.ts](file://src/main/ipc/mcp.ts#L52-L80)

## Integration Examples

### Basic Electron Integration

Here's a complete example of integrating the MCP server within an Electron application:

```typescript
// Main process integration example
import { app, BrowserWindow } from 'electron';
import { initDatabase } from '../database/init';

app.whenReady().then(async () => {
  // Initialize database first
  await initDatabase();
  
  // Register IPC handlers
  require('./ipc/mcp');
  
  // Load MCP configuration
  const mcpRepo = require('../database/mcpRepo');
  const mcpConfig = mcpRepo.getMCPConfig();
  
  // Conditionally start server
  if (mcpConfig.enabled && mcpConfig.autoStart) {
    const { startMCPServer } = require('./ipc/mcp');
    await startMCPServer();
  }
});
```

### Custom Server Configuration

Example of custom server configuration with environment variables:

```typescript
// Custom server configuration
process.env.MCP_SERVER_PORT = '8080';
process.env.MCP_SERVER_HOST = '0.0.0.0';
process.env.MCP_CORS_ORIGIN = 'https://myapp.com';

// Start server programmatically
import { startMcpServer } from './mcp-server';

startMcpServer().then(success => {
  if (success) {
    console.log('MCP Server started successfully');
  }
}).catch(error => {
  console.error('Failed to start MCP Server:', error);
});
```

**Section sources**
- [index.ts](file://src/main/index.ts#L60-L95)
- [mcp.ts](file://src/main/ipc/mcp.ts#L10-L50)

## Monitoring and Status

### Real-Time Status Monitoring

The system provides comprehensive real-time monitoring capabilities through the status indicator component and IPC-based status queries.

```mermaid
classDiagram
class MCPServerStatus {
+running boolean
+port number
+host string
+uptime number
+error string
}
class StatusIndicator {
+pollStatus() Promise~void~
+formatUptime(ms) string
+getColor(status) string
+getLabel(status) string
}
class StatusPoller {
+interval number
+isMounted boolean
+startPolling() void
+stopPolling() void
+checkAPIAvailability() boolean
}
StatusIndicator --> MCPServerStatus : displays
StatusIndicator --> StatusPoller : uses
StatusPoller --> MCPServerStatus : retrieves
```

**Diagram sources**
- [MCPStatusIndicator.tsx](file://src/renderer/components/MCPStatusIndicator.tsx#L10-L50)
- [mcp.ts](file://src/main/ipc/mcp.ts#L82-L90)

### Status Display Components

The status indicator component provides visual feedback about the server's operational state with real-time updates.

| Status State | Visual Indicator | Uptime Display | Error Handling |
|-------------|------------------|----------------|----------------|
| Running | Green dot with pulse animation | Hours:Minutes:Seconds | Normal operation |
| Stopped | Red dot | N/A | No service available |
| Loading | Yellow dot | N/A | API connection pending |
| Error | Red dot | N/A | Service unavailable |

**Section sources**
- [MCPStatusIndicator.tsx](file://src/renderer/components/MCPStatusIndicator.tsx#L10-L135)
- [mcp.ts](file://src/main/ipc/mcp.ts#L82-L90)

## Troubleshooting Guide

### Common Startup Issues

#### Database Initialization Failures

**Symptoms**: Server fails to start with database-related errors
**Causes**: 
- Disk space limitations
- Permission denied accessing database file
- Corrupted database file
- Missing database directory

**Resolution Steps**:
1. Check disk space availability
2. Verify application permissions
3. Attempt database repair
4. Reset to default configuration

#### Port Binding Conflicts

**Symptoms**: Server fails to bind to configured port
**Causes**:
- Port already in use by another process
- Insufficient privileges for privileged ports (< 1024)
- Firewall blocking port access

**Resolution Steps**:
1. Change to alternative port
2. Check for conflicting applications
3. Run with elevated privileges
4. Configure firewall exceptions

#### Process Spawn Failures

**Symptoms**: Child process fails to start in Electron mode
**Causes**:
- Missing server binary
- Incorrect executable permissions
- Missing dependencies
- Path resolution issues

**Resolution Steps**:
1. Verify server binary exists
2. Check executable permissions
3. Install missing dependencies
4. Validate path resolution

### Performance Optimization

#### Memory Management

Monitor memory usage patterns and implement appropriate garbage collection strategies for long-running server instances.

#### Connection Pooling

Configure optimal connection pool sizes for database operations to balance performance and resource utilization.

#### Request Throttling

Implement rate limiting to prevent resource exhaustion under high load conditions.

**Section sources**
- [mcp.ts](file://src/main/ipc/mcp.ts#L20-L30)
- [mcp-server.ts](file://src/server/mcp-server.ts#L52-L78)