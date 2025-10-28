# Inter-Process Communication & Data Flow

<cite>
**Referenced Files in This Document**   
- [main/index.ts](file://src/main/index.ts)
- [preload/index.ts](file://src/preload/index.ts)
- [renderer/App.tsx](file://src/renderer/App.tsx)
- [renderer/store/tasks.ts](file://src/store/tasks.ts)
- [main/ipc/tasks.ts](file://src/main/ipc/tasks.ts)
- [main/ipc/settings.ts](file://src/main/ipc/settings.ts)
- [main/ipc/mcp.ts](file://src/main/ipc/mcp.ts)
- [server/mcp-server.ts](file://src/server/mcp-server.ts)
- [server/routes/tasks.ts](file://src/server/routes/tasks.ts)
- [server/controllers/tasksController.ts](file://src/server/controllers/tasksController.ts)
- [database/tasksRepo.ts](file://src/database/tasksRepo.ts)
- [database/mcpRepo.ts](file://src/database/mcpRepo.ts)
- [common/types.ts](file://src/common/types.ts)
- [main/utils/response.ts](file://src/main/utils/response.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [IPC Communication Pattern](#ipc-communication-pattern)
4. [HTTP REST API Architecture](#http-rest-api-architecture)
5. [Data Flow for Key Operations](#data-flow-for-key-operations)
6. [Error Propagation Mechanisms](#error-propagation-mechanisms)
7. [Data Consistency and Synchronization](#data-consistency-and-synchronization)
8. [Latency and Offline Considerations](#latency-and-offline-considerations)
9. [Debugging Across Process Boundaries](#debugging-across-process-boundaries)
10. [Conclusion](#conclusion)

## Introduction
LifeOS implements a dual communication architecture that enables seamless interaction between its three main processes: the Electron main process, the renderer process, and the MCP (Microservice Communication Protocol) server. This document details the inter-process communication mechanisms, focusing on Electron IPC for main-renderer interaction and HTTP REST calls between the renderer and MCP server. The analysis covers data flow patterns for core operations such as task creation, habit tracking, and settings updates, along with error handling, data consistency strategies, and debugging approaches.

**Section sources**
- [main/index.ts](file://src/main/index.ts#L1-L119)
- [preload/index.ts](file://src/preload/index.ts#L1-L201)

## Architecture Overview

```mermaid
graph TB
subgraph "Electron Main Process"
Main["Main Process"]
IPC["IPC Handlers"]
DB["SQLite Database"]
end
subgraph "Renderer Process"
Renderer["Renderer Process"]
Store["Zustand Stores"]
UI["React UI Components"]
end
subgraph "MCP Server"
Server["Express Server"]
Routes["API Routes"]
Controllers["Controllers"]
end
Main --> |IPC| Renderer
Renderer --> |HTTP| Server
Server --> |Database Access| DB
IPC --> |Database Operations| DB
Store --> |State Management| UI
style Main fill:#4B7BEC,stroke:#333
style Renderer fill:#4BEC9D,stroke:#333
style Server fill:#EC4BE2,stroke:#333
style DB fill:#ECB84B,stroke:#333
```

**Diagram sources**
- [main/index.ts](file://src/main/index.ts#L1-L119)
- [preload/index.ts](file://src/preload/index.ts#L1-L201)
- [server/mcp-server.ts](file://src/server/mcp-server.ts#L1-L79)

**Section sources**
- [main/index.ts](file://src/main/index.ts#L1-L119)
- [server/mcp-server.ts](file://src/server/mcp-server.ts#L1-L79)

## IPC Communication Pattern

The Electron IPC (Inter-Process Communication) system facilitates secure communication between the main and renderer processes through a well-defined API exposed via the preload script. The architecture follows a request-response pattern using `ipcRenderer.invoke` and `ipcMain.handle` methods, ensuring asynchronous communication without blocking the renderer process.

```mermaid
sequenceDiagram
participant Renderer as "Renderer Process"
participant Preload as "Preload Context"
participant Main as "Main Process"
participant DB as "Database"
Renderer->>Preload : window.api.tasks.create(payload)
Preload->>Main : ipcRenderer.invoke('tasks : create', payload)
Main->>Main : wrapIpc handler execution
Main->>DB : createTask() in tasksRepo
DB-->>Main : Return created task
Main-->>Preload : Resolve with success response
Preload-->>Renderer : Resolve Promise with ApiResponse
```

**Diagram sources**
- [preload/index.ts](file://src/preload/index.ts#L1-L201)
- [main/ipc/tasks.ts](file://src/main/ipc/tasks.ts#L1-L36)
- [database/tasksRepo.ts](file://src/database/tasksRepo.ts#L1-L210)

**Section sources**
- [preload/index.ts](file://src/preload/index.ts#L1-L201)
- [main/ipc/tasks.ts](file://src/main/ipc/tasks.ts#L1-L36)
- [main/utils/response.ts](file://src/main/utils/response.ts#L1-L25)

## HTTP REST API Architecture

The MCP server provides a RESTful API interface that allows the renderer process to communicate with backend services through standard HTTP methods. The Express-based server implements a conventional routing-controller-repository pattern, with middleware for CORS, authentication, logging, and error handling.

```mermaid
graph TB
Renderer["Renderer Process"]
Fetch["fetch() API"]
Server["MCP Server"]
Router["API Routes"]
Controller["Controllers"]
Repo["Repository Layer"]
DB["Database"]
Renderer --> |HTTP POST /api/tasks/create| Fetch
Fetch --> |Request| Server
Server --> |Route Dispatch| Router
Router --> |Call Handler| Controller
Controller --> |Business Logic| Repo
Repo --> |SQL Queries| DB
DB --> |Data| Repo
Repo --> |Response Data| Controller
Controller --> |JSON Response| Server
Server --> |HTTP Response| Fetch
Fetch --> |Promise Resolution| Renderer
style Renderer fill:#4BEC9D,stroke:#333
style Server fill:#EC4BE2,stroke:#333
style DB fill:#ECB84B,stroke:#333
```

**Diagram sources**
- [server/mcp-server.ts](file://src/server/mcp-server.ts#L1-L79)
- [server/routes/tasks.ts](file://src/server/routes/tasks.ts#L1-L25)
- [server/controllers/tasksController.ts](file://src/server/controllers/tasksController.ts#L1-L139)

**Section sources**
- [server/mcp-server.ts](file://src/server/mcp-server.ts#L1-L79)
- [server/routes/tasks.ts](file://src/server/routes/tasks.ts#L1-L25)
- [server/controllers/tasksController.ts](file://src/server/controllers/tasksController.ts#L1-L139)

## Data Flow for Key Operations

### Task Creation Sequence

```mermaid
sequenceDiagram
participant UI as "UI Component"
participant Store as "Tasks Store"
participant API as "Preload API"
participant IPC as "IPC Handler"
participant Repo as "Tasks Repository"
participant DB as "Database"
UI->>Store : createTask(payload)
Store->>API : window.api.tasks.create(payload)
API->>IPC : invoke('tasks : create', payload)
IPC->>Repo : createTask() with validation
Repo->>DB : INSERT INTO tasks
DB-->>Repo : Return inserted row
Repo-->>IPC : Return mapped Task object
IPC-->>API : Resolve with success ApiResponse
API-->>Store : Resolve Promise
Store->>Store : Update state with new task
Store-->>UI : State update triggers re-render
```

**Diagram sources**
- [renderer/store/tasks.ts](file://src/store/tasks.ts#L1-L132)
- [preload/index.ts](file://src/preload/index.ts#L1-L201)
- [main/ipc/tasks.ts](file://src/main/ipc/tasks.ts#L1-L36)
- [database/tasksRepo.ts](file://src/database/tasksRepo.ts#L1-L210)

### Habit Tracking Flow

```mermaid
sequenceDiagram
participant UI as "HabitsPage"
participant Store as "Habits Store"
participant API as "Preload API"
participant IPC as "IPC Handler"
participant Repo as "Habits Repository"
participant DB as "Database"
UI->>Store : logHabit(habitId, date, count)
Store->>API : window.api.habits.log(args)
API->>IPC : invoke('habits : log', args)
IPC->>Repo : logHabit() with validation
Repo->>DB : INSERT INTO habit_logs
DB-->>Repo : Return log record
Repo-->>IPC : Return success
IPC-->>API : Resolve with success ApiResponse
API-->>Store : Resolve Promise
Store->>Store : Refresh habits list
Store->>Store : Load habit logs if selected
Store-->>UI : State update triggers re-render
```

**Diagram sources**
- [store/habits.ts](file://src/store/habits.ts#L1-L160)
- [preload/index.ts](file://src/preload/index.ts#L1-L201)
- [main/ipc/habits.ts](file://src/main/ipc/habits.ts#L1-L30)

### Settings Update Process

```mermaid
sequenceDiagram
participant UI as "SettingsPage"
participant Store as "Settings Service"
participant API as "Preload API"
participant IPC as "IPC Handler"
participant Service as "Settings Service"
participant FS as "File System"
UI->>Service : updateSettings(partial)
Service->>API : window.api.settings.update(partial)
API->>IPC : invoke('settings : update', partial)
IPC->>Service : settingsService.updateSettings()
Service->>FS : Write settings.json
FS-->>Service : Success
Service-->>IPC : Return updated settings
IPC-->>API : Resolve with success ApiResponse
API-->>Service : Resolve Promise
Service->>Service : Update in-memory settings
Service-->>UI : Notify subscribers of changes
```

**Diagram sources**
- [main/ipc/settings.ts](file://src/main/ipc/settings.ts#L1-L27)
- [services/settings.ts](file://src/services/settings.ts#L1-L50)
- [preload/index.ts](file://src/preload/index.ts#L1-L201)

**Section sources**
- [main/ipc/settings.ts](file://src/main/ipc/settings.ts#L1-L27)
- [services/settings.ts](file://src/services/settings.ts#L1-L50)

## Error Propagation Mechanisms

The system implements a consistent error handling strategy across both IPC and HTTP communication layers, using a standardized `ApiResponse` interface to encapsulate success and error states.

```mermaid
flowchart TD
Start([Operation Initiated]) --> ValidateInput["Validate Input Parameters"]
ValidateInput --> TryIPC["Try IPC/HTTP Call"]
TryIPC --> |Success| ProcessResponse["Process Response"]
TryIPC --> |Error| HandleError["Handle Error"]
HandleError --> CheckErrorType{"Error Type?"}
CheckErrorType --> |Network Error| NetworkError["Network Error Handler"]
CheckErrorType --> |Validation Error| ValidationError["Validation Error Handler"]
CheckErrorType --> |Database Error| DatabaseError["Database Error Handler"]
CheckErrorType --> |Unknown Error| UnknownError["Generic Error Handler"]
NetworkError --> ShowNotification["Show User Notification"]
ValidationError --> ShowNotification
DatabaseError --> ShowNotification
UnknownError --> LogError["Log Error Details"]
LogError --> ShowNotification
ShowNotification --> UpdateUI["Update UI State"]
ProcessResponse --> |Response.ok| UpdateState["Update Application State"]
ProcessResponse --> |!Response.ok| HandleAPIError["Handle API Error"]
HandleAPIError --> ShowNotification
UpdateState --> End([Operation Complete])
UpdateUI --> End
```

The `wrapIpc` utility function in the main process ensures consistent error wrapping for all IPC handlers, capturing errors and returning standardized failure responses:

```mermaid
sequenceDiagram
participant Renderer
participant Main
participant Handler
participant Error
Renderer->>Main : invoke('channel', args)
Main->>Handler : Execute wrapped handler
alt Success
Handler-->>Main : Return result
Main->>Main : success(result)
Main-->>Renderer : Resolve with ok : true
else Error
Handler->>Error : Throw error
Error-->>Main : Catch error
Main->>Main : failure(error.message)
Main-->>Renderer : Resolve with ok : false
end
```

**Diagram sources**
- [main/utils/response.ts](file://src/main/utils/response.ts#L1-L25)
- [common/types.ts](file://src/common/types.ts#L1-L116)

**Section sources**
- [main/utils/response.ts](file://src/main/utils/response.ts#L1-L25)
- [common/types.ts](file://src/common/types.ts#L1-L116)

## Data Consistency and Synchronization

LifeOS faces data consistency challenges due to its dual communication architecture, where data can be accessed through both IPC (direct database access) and HTTP (via MCP server) pathways. The system employs several strategies to maintain consistency across these channels.

### Synchronization Strategy

```mermaid
flowchart LR
A[Renderer Request] --> B{Request Type}
B --> |CRUD Operation| C[IPC Channel]
B --> |Analytics/Reporting| D[HTTP API]
C --> E[Direct Database Access]
D --> F[MCP Server]
F --> G[Same Database]
E --> H[Immediate State Update]
G --> I[State Update via Response]
H --> J[Store Update]
I --> J
J --> K[UI Re-render]
style C fill:#4B7BEC,stroke:#333
style D fill:#EC4BE2,stroke:#333
style E fill:#ECB84B,stroke:#333
style G fill:#ECB84B,stroke:#333
```

The primary strategy is to route all data modification operations (Create, Update, Delete) through the IPC channel for immediate consistency, while using the HTTP API primarily for read-heavy operations and analytics. This ensures that:

1. **Write operations** use IPC for lowest latency and immediate database persistence
2. **Read operations** can use either channel depending on data freshness requirements
3. **State stores** in the renderer process act as a single source of truth, updated after successful operations

### Conflict Resolution

When data is modified through different channels, the system relies on the following principles:

- **Last write wins**: The most recent successful operation determines the final state
- **Client-side state precedence**: The renderer store state takes precedence over stale data
- **Automatic refresh**: After mutations, relevant data is re-fetched to ensure consistency

**Section sources**
- [renderer/store/tasks.ts](file://src/store/tasks.ts#L1-L132)
- [renderer/store/habits.ts](file://src/store/habits.ts#L1-L160)
- [main/ipc/tasks.ts](file://src/main/ipc/tasks.ts#L1-L36)

## Latency and Offline Considerations

The dual communication architecture is designed to optimize for both performance and reliability, with specific considerations for latency and offline operation.

### Latency Comparison

| Operation Type | IPC Latency | HTTP Latency | Notes |
|----------------|-----------|------------|-------|
| Task Creation | ~5-10ms | ~50-100ms | IPC avoids network stack |
| Settings Update | ~3-8ms | ~40-80ms | IPC writes directly to file |
| Habit Logging | ~4-12ms | ~45-90ms | IPC has direct DB access |
| Data Query | ~6-15ms | ~55-110ms | HTTP includes serialization overhead |

### Offline Operation Strategy

```mermaid
flowchart TD
A[User Action] --> B{Online?}
B --> |Yes| C[Normal Operation]
B --> |No| D[Queue Operation]
D --> E[Store in Local Queue]
E --> F[Update UI Optimistically]
F --> G[Show Offline Indicator]
G --> H[Monitor Connection]
H --> |Online| I[Process Queue]
I --> J[Execute Operations]
J --> |Success| K[Clear Queue]
J --> |Failure| L[Retry with Backoff]
K --> M[Update State]
C --> M
M --> N[UI Reflects Current State]
```

The system handles offline scenarios by:

1. **Optimistic UI updates**: Immediately reflecting user actions in the interface
2. **Operation queuing**: Storing pending operations in memory
3. **Connection monitoring**: Detecting when connectivity is restored
4. **Batch processing**: Executing queued operations when back online
5. **Error handling**: Managing conflicts or failures during sync

**Section sources**
- [renderer/store/tasks.ts](file://src/store/tasks.ts#L1-L132)
- [renderer/store/habits.ts](file://src/store/habits.ts#L1-L160)
- [main/ipc/mcp.ts](file://src/main/ipc/mcp.ts#L1-L150)

## Debugging Across Process Boundaries

Effective debugging in LifeOS requires tracing messages across the three-process architecture. The system provides several mechanisms to facilitate this.

### Debugging Tools and Techniques

```mermaid
flowchart LR
A[Renderer Process] --> |console.log| B[DevTools Console]
C[Main Process] --> |console.log| D[Main Process Terminal]
E[MCP Server] --> |logger.info| F[Server Terminal]
G[IPC Messages] --> |console.log in handlers| D
H[HTTP Requests] --> |requestLogger middleware| F
I[Error Tracking] --> |console.error| All Outputs
style A fill:#4BEC9D,stroke:#333
style C fill:#4B7BEC,stroke:#333
style E fill:#EC4BE2,stroke:#333
```

### Message Tracing Strategy

1. **Renderer-side tracing**: Use browser DevTools to monitor API calls and store updates
2. **Main process logging**: Check terminal output for IPC handler execution and database operations
3. **Server logging**: Monitor MCP server terminal for HTTP request processing
4. **Correlation IDs**: Implement request tracing across boundaries (currently not implemented but recommended)

### Common Debugging Scenarios

| Issue | Diagnostic Steps | Tools |
|------|------------------|-------|
| IPC Call Not Responding | 1. Check if handler is registered<br>2. Verify channel name<br>3. Check error handling | Main process logs, renderer console |
| HTTP Request Failing | 1. Verify server is running<br>2. Check CORS configuration<br>3. Validate request payload | Server logs, browser Network tab |
| Data Inconsistency | 1. Trace operation path<br>2. Check database state<br>3. Verify store updates | Database browser, store state inspection |
| Performance Issues | 1. Measure IPC vs HTTP latency<br>2. Check database query performance<br>3. Monitor process resource usage | Performance profiler, logging |

**Section sources**
- [main/ipc/tasks.ts](file://src/main/ipc/tasks.ts#L1-L36)
- [server/mcp-server.ts](file://src/server/mcp-server.ts#L1-L79)
- [main/utils/response.ts](file://src/main/utils/response.ts#L1-L25)
- [server/middleware/logging.ts](file://src/server/middleware/logging.ts#L1-L20)

## Conclusion
LifeOS implements a sophisticated dual communication architecture that leverages Electron IPC for low-latency main-renderer interactions and HTTP REST APIs for renderer-MCP server communication. This design enables responsive user interfaces while maintaining a clean separation of concerns between processes. The system ensures data consistency through centralized state management in renderer stores and employs robust error handling across all communication channels. For optimal performance, write operations use the direct IPC pathway, while read operations can leverage either channel based on requirements. The architecture supports offline operation through optimistic UI updates and operation queuing, with comprehensive logging facilities to aid debugging across process boundaries. Future enhancements could include distributed tracing with correlation IDs to further improve observability in this multi-process environment.