# Extension Points

<cite>
**Referenced Files in This Document**   
- [mcp-server.ts](file://src/server/mcp-server.ts)
- [auth.ts](file://src/server/middleware/auth.ts)
- [rateLimiter.ts](file://src/server/middleware/rateLimiter.ts)
- [tasksController.ts](file://src/server/controllers/tasksController.ts)
- [habitsController.ts](file://src/server/controllers/habitsController.ts)
- [projectsController.ts](file://src/server/controllers/projectsController.ts)
- [notebooksController.ts](file://src/server/controllers/notebooksController.ts)
- [notesController.ts](file://src/server/controllers/notesController.ts)
- [qaController.ts](file://src/server/controllers/qaController.ts)
- [activitiesController.ts](file://src/server/controllers/activitiesController.ts)
- [settingsController.ts](file://src/server/controllers/settingsController.ts)
- [statusController.ts](file://src/server/controllers/statusController.ts)
- [tasks.ts](file://src/server/routes/tasks.ts)
- [habits.ts](file://src/server/routes/habits.ts)
- [projects.ts](file://src/server/routes/projects.ts)
- [notebooks.ts](file://src/server/routes/notebooks.ts)
- [notes.ts](file://src/server/routes/notes.ts)
- [qa.ts](file://src/server/routes/qa.ts)
- [activities.ts](file://src/server/routes/activities.ts)
- [settings.ts](file://src/server/routes/settings.ts)
- [status.ts](file://src/server/routes/status.ts)
- [tasksRepo.ts](file://src/database/tasksRepo.ts)
- [habitsRepo.ts](file://src/database/habitsRepo.ts)
- [types.ts](file://src/common/types.ts)
- [mcp.md](file://AI/mcp.md)
- [mcp.ts](file://src/main/ipc/mcp.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [API Overview](#api-overview)
3. [Authentication and Security](#authentication-and-security)
4. [Rate Limiting](#rate-limiting)
5. [CORS Configuration](#cors-configuration)
6. [Error Handling](#error-handling)
7. [Module Endpoints](#module-endpoints)
8. [Global Status Endpoint](#global-status-endpoint)
9. [Usage Examples](#usage-examples)
10. [Configuration](#configuration)
11. [Integration with Electron App](#integration-with-electron-app)
12. [Future Enhancements](#future-enhancements)
13. [Security Considerations](#security-considerations)

## Introduction

The MCP Server extension point provides a RESTful HTTP API interface to expose LifeOS functionality for integration with AI models and external tools. The server runs on port 3000 by default (configurable) and provides comprehensive endpoints for all core modules including Tasks, Projects, Habits, Notebooks, Notes, Q&A, Activities, and Settings. This documentation details the API design, endpoints, authentication strategy, and implementation details.

**Section sources**
- [mcp-server.ts](file://src/server/mcp-server.ts#L1-L80)
- [mcp.md](file://AI/mcp.md#L354-L390)

## API Overview

The MCP Server implements a RESTful API design with JSON endpoints organized by module. All endpoints follow a consistent pattern with standardized request and response formats. The server is built using Express.js and provides clean, predictable routes for all LifeOS functionality.

```mermaid
graph TB
subgraph "MCP Server"
A[HTTP Requests] --> B[CORS Middleware]
B --> C[Rate Limiter]
C --> D[Authentication]
D --> E[Route Handlers]
E --> F[Database Repositories]
F --> G[SQLite Database]
end
```

**Diagram sources**
- [mcp-server.ts](file://src/server/mcp-server.ts#L1-L80)
- [auth.ts](file://src/server/middleware/auth.ts#L1-L25)
- [rateLimiter.ts](file://src/server/middleware/rateLimiter.ts#L1-L69)

**Section sources**
- [mcp-server.ts](file://src/server/mcp-server.ts#L1-L80)
- [README.md](file://src/server/README.md#L1-L292)

## Authentication and Security

The MCP Server implements a flexible authentication strategy with optional API key protection. By default, the server binds to localhost for security, and API key authentication is enforced when configured.

### Authentication Strategy

The server uses middleware to handle authentication for all endpoints except the health check:

```mermaid
sequenceDiagram
participant Client
participant Server
participant Auth
Client->>Server : HTTP Request
Server->>Auth : Check X-API-Key header
alt API Key Configured
Auth->>Server : Validate key
alt Valid Key
Server->>Client : Process Request
else Invalid or Missing Key
Server->>Client : 401 Unauthorized
end
else API Key Not Configured
Server->>Client : Process Request
end
```

**Diagram sources**
- [auth.ts](file://src/server/middleware/auth.ts#L1-L25)
- [mcp-server.ts](file://src/server/mcp-server.ts#L1-L80)

**Section sources**
- [auth.ts](file://src/server/middleware/auth.ts#L1-L25)
- [mcp.md](file://AI/mcp.md#L354-L390)

## Rate Limiting

The MCP Server implements rate limiting to prevent abuse and ensure system stability. The default limit is 100 requests per minute per IP address, which is configurable via environment variables.

```mermaid
flowchart TD
Start([Request Received]) --> CheckPath["Check if path is /health"]
CheckPath --> |Yes| Allow["Allow request"]
CheckPath --> |No| GetIP["Get client IP address"]
GetIP --> CheckStore["Check rate limit store"]
CheckStore --> |New IP or Expired Window| Initialize["Initialize counter to 1"]
CheckStore --> |Existing IP within window| Increment["Increment counter"]
Increment --> CheckLimit["Check if count > limit"]
CheckLimit --> |Yes| Reject["Return 429 Too Many Requests"]
CheckLimit --> |No| Allow
Initialize --> SetHeaders["Set rate limit headers"]
Increment --> SetHeaders
SetHeaders --> Allow
Allow --> Process["Process request"]
Reject --> Respond["Send error response"]
```

**Diagram sources**
- [rateLimiter.ts](file://src/server/middleware/rateLimiter.ts#L1-L69)

**Section sources**
- [rateLimiter.ts](file://src/server/middleware/rateLimiter.ts#L1-L69)

## CORS Configuration

The MCP Server includes CORS middleware to control cross-origin resource sharing. The allowed origins are configurable via environment variables, with a default setting of '*' (allow all origins).

```mermaid
sequenceDiagram
participant Browser
participant Server
participant CORS
Browser->>Server : OPTIONS Request (Preflight)
Server->>CORS : Check origin against MCP_CORS_ORIGIN
alt Origin Allowed
CORS->>Server : Set Access-Control-Allow headers
Server->>Browser : 200 OK with CORS headers
Browser->>Server : Actual Request
Server->>Browser : Response with CORS headers
else Origin Not Allowed
CORS->>Server : Deny request
Server->>Browser : 403 Forbidden
end
```

**Diagram sources**
- [mcp-server.ts](file://src/server/mcp-server.ts#L1-L80)

## Error Handling

The MCP Server implements standardized error responses with consistent formatting across all endpoints. Errors are handled by a dedicated middleware that formats responses according to a predefined schema.

### Error Response Format

```mermaid
classDiagram
class ErrorResponse {
+error : ErrorDetail
}
class ErrorDetail {
+code : string
+message : string
+details : object
}
ErrorResponse --> ErrorDetail : contains
```

**Diagram sources**
- [errorHandler.ts](file://src/server/middleware/errorHandler.ts#L1-L70)

**Section sources**
- [errorHandler.ts](file://src/server/middleware/errorHandler.ts#L1-L70)
- [mcp.md](file://AI/mcp.md#L354-L390)

## Module Endpoints

The MCP Server exposes RESTful endpoints for all core LifeOS modules. Each module follows a consistent pattern with standardized HTTP methods and URL structures.

### Tasks Module

The Tasks module provides endpoints for managing tasks within projects.

```mermaid
flowchart TD
A[POST /api/tasks/create] --> B[Create new task]
C[GET /api/tasks/:id] --> D[Get task by ID]
E[GET /api/tasks/project/:projectId] --> F[List tasks by project]
G[PUT /api/tasks/:id] --> H[Update task]
I[DELETE /api/tasks/:id] --> J[Delete task]
K[PUT /api/tasks/:id/move] --> L[Move task]
M[GET /api/tasks] --> N[Get tasks status]
```

**Diagram sources**
- [tasks.ts](file://src/server/routes/tasks.ts#L1-L25)
- [tasksController.ts](file://src/server/controllers/tasksController.ts#L1-L139)

**Section sources**
- [tasks.ts](file://src/server/routes/tasks.ts#L1-L25)
- [tasksController.ts](file://src/server/controllers/tasksController.ts#L1-L139)
- [tasksRepo.ts](file://src/database/tasksRepo.ts#L1-L199)

### Habits Module

The Habits module provides endpoints for managing habit tracking and completion logging.

```mermaid
flowchart TD
A[POST /api/habits/create] --> B[Create new habit]
C[GET /api/habits/:id] --> D[Get habit by ID]
E[GET /api/habits] --> F[List all habits]
G[PUT /api/habits/:id] --> H[Update habit]
I[DELETE /api/habits/:id] --> J[Delete habit]
K[POST /api/habits/:id/log] --> L[Log habit completion]
M[DELETE /api/habits/:id/log/:date] --> N[Unlog habit]
O[GET /api/habits/:id/logs] --> P[Get habit logs]
Q[GET /api/habits/status] --> R[Get habits status]
```

**Diagram sources**
- [habits.ts](file://src/server/routes/habits.ts#L1-L31)
- [habitsController.ts](file://src/server/controllers/habitsController.ts#L1-L131)

**Section sources**
- [habits.ts](file://src/server/routes/habits.ts#L1-L31)
- [habitsController.ts](file://src/server/controllers/habitsController.ts#L1-L131)
- [habitsRepo.ts](file://src/database/habitsRepo.ts#L1-L199)

### Projects Module

The Projects module provides endpoints for managing projects and their organization.

```mermaid
flowchart TD
A[POST /api/projects/create] --> B[Create new project]
C[GET /api/projects/:id] --> D[Get project by ID]
E[GET /api/projects] --> F[List all projects]
G[PUT /api/projects/:id] --> H[Update project]
I[DELETE /api/projects/:id] --> J[Delete project]
K[PUT /api/projects/reorder] --> L[Reorder projects]
M[PUT /api/projects/:id/set-active] --> N[Set active project]
O[GET /api/projects/status] --> P[Get projects status]
```

**Section sources**
- [projects.ts](file://src/server/routes/projects.ts)
- [projectsController.ts](file://src/server/controllers/projectsController.ts)

### Notebooks Module

The Notebooks module provides endpoints for managing notebooks and their organization.

```mermaid
flowchart TD
A[POST /api/notebooks/create] --> B[Create new notebook]
C[GET /api/notebooks/:id] --> D[Get notebook by ID]
E[GET /api/notebooks] --> F[List all notebooks]
G[PUT /api/notebooks/:id] --> H[Update notebook]
I[DELETE /api/notebooks/:id] --> J[Delete notebook]
K[GET /api/notebooks/status] --> L[Get notebooks status]
```

**Section sources**
- [notebooks.ts](file://src/server/routes/notebooks.ts)
- [notebooksController.ts](file://src/server/controllers/notebooksController.ts)

### Notes Module

The Notes module provides endpoints for managing individual notes within notebooks.

```mermaid
flowchart TD
A[POST /api/notes/create] --> B[Create new note]
C[GET /api/notes/:id] --> D[Get note by ID]
E[GET /api/notes/notebook/:notebookId] --> F[List notes in notebook]
G[PUT /api/notes/:id] --> H[Update note]
I[DELETE /api/notes/:id] --> J[Delete note]
K[GET /api/notes/search?q=query] --> L[Search notes]
M[GET /api/notes/status] --> N[Get notes status]
```

**Section sources**
- [notes.ts](file://src/server/routes/notes.ts)
- [notesController.ts](file://src/server/controllers/notesController.ts)

### Q&A Module

The Q&A module provides endpoints for managing question and answer collections.

```mermaid
flowchart TD
A[POST /api/qa/collections/create] --> B[Create collection]
C[GET /api/qa/collections/:id] --> D[Get collection]
E[GET /api/qa/collections] --> F[List collections]
G[PUT /api/qa/collections/:id] --> H[Update collection]
I[DELETE /api/qa/collections/:id] --> J[Delete collection]
K[POST /api/qa/questions/create] --> L[Create question]
M[GET /api/qa/questions/:id] --> N[Get question]
O[GET /api/qa/questions?collectionId=X] --> P[List questions]
Q[PUT /api/qa/questions/:id] --> R[Update question]
S[DELETE /api/qa/questions/:id] --> T[Delete question]
U[POST /api/qa/answers/create] --> V[Create answer]
W[GET /api/qa/answers/:questionId] --> X[Get answers]
Y[PUT /api/qa/answers/:id] --> Z[Update answer]
AA[DELETE /api/qa/answers/:id] --> AB[Delete answer]
AC[GET /api/qa/status] --> AD[Get Q&A status]
```

**Section sources**
- [qa.ts](file://src/server/routes/qa.ts)
- [qaController.ts](file://src/server/controllers/qaController.ts)

### Activities Module

The Activities module provides endpoints for retrieving activity data and statistics.

```mermaid
flowchart TD
A[GET /api/activities] --> B[Get all activities]
C[GET /api/activities/date/:date] --> D[Get activities by date]
E[GET /api/activities/type/:type] --> F[Get activities by type]
G[GET /api/activities/status] --> H[Get activities status]
```

**Section sources**
- [activities.ts](file://src/server/routes/activities.ts)
- [activitiesController.ts](file://src/server/controllers/activitiesController.ts)

### Settings Module

The Settings module provides endpoints for managing application settings.

```mermaid
flowchart TD
A[GET /api/settings] --> B[Get all settings]
C[PUT /api/settings] --> D[Update settings]
E[GET /api/settings/theme] --> F[Get theme]
G[PUT /api/settings/theme] --> H[Update theme]
```

**Section sources**
- [settings.ts](file://src/server/routes/settings.ts)
- [settingsController.ts](file://src/server/controllers/settingsController.ts)

## Global Status Endpoint

The global status endpoint provides comprehensive system health information and module statistics, serving as a central monitoring point for the entire system.

```mermaid
flowchart TD
A[GET /api/status] --> B[Collect system information]
B --> C[Gather tasks statistics]
B --> D[Gather projects statistics]
B --> E[Gather habits statistics]
B --> F[Gather notebooks statistics]
B --> G[Gather Q&A statistics]
B --> H[Gather activities statistics]
B --> I[Check database health]
C --> J[Calculate completion rates]
D --> K[Identify active project]
E --> L[Calculate streaks]
F --> M[Count words and notes]
G --> N[Track unanswered questions]
H --> O[Calculate activity streak]
J --> P[Compile status object]
K --> P
L --> P
M --> P
N --> P
O --> P
I --> P
P --> Q[Return comprehensive status]
```

**Diagram sources**
- [status.ts](file://src/server/routes/status.ts#L1-L7)
- [statusController.ts](file://src/server/controllers/statusController.ts#L1-L150)

**Section sources**
- [status.ts](file://src/server/routes/status.ts#L1-L7)
- [statusController.ts](file://src/server/controllers/statusController.ts#L1-L150)

## Usage Examples

This section provides practical examples of using the MCP Server API for common operations.

### Create a Task

```bash
curl -X POST http://localhost:3000/api/tasks/create \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_key" \
  -d '{
    "projectId": 1,
    "title": "Implement feature X",
    "description": "Complete implementation",
    "status": "To-Do",
    "estimatedMinutes": 120
  }'
```

**Section sources**
- [tasksController.ts](file://src/server/controllers/tasksController.ts#L1-L139)
- [tasksRepo.ts](file://src/database/tasksRepo.ts#L1-L199)

### Log a Habit

```bash
curl -X POST http://localhost:3000/api/habits/1/log \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_key" \
  -d '{
    "loggedDate": "2024-10-27",
    "count": 1,
    "note": "Completed successfully"
  }'
```

**Section sources**
- [habitsController.ts](file://src/server/controllers/habitsController.ts#L1-L131)
- [habitsRepo.ts](file://src/database/habitsRepo.ts#L1-L199)

### Retrieve Project Status

```bash
curl http://localhost:3000/api/projects/status \
  -H "X-API-Key: your_key"
```

**Section sources**
- [projectsController.ts](file://src/server/controllers/projectsController.ts)
- [projectsRepo.ts](file://src/database/projectsRepo.ts)

## Configuration

The MCP Server can be configured through environment variables, allowing customization of key parameters without code changes.

### Environment Variables

| Variable | Default | Description |
|--------|--------|-------------|
| MCP_SERVER_PORT | 3000 | Server port |
| MCP_SERVER_HOST | localhost | Server host |
| MCP_API_KEY | (none) | Optional API key for authentication |
| MCP_RATE_LIMIT | 100 | Requests per minute limit |
| MCP_LOG_LEVEL | info | Logging verbosity |
| MCP_CORS_ORIGIN | * | Allowed CORS origins |

**Section sources**
- [mcp-server.ts](file://src/server/mcp-server.ts#L1-L80)
- [README.md](file://src/server/README.md#L1-L292)

## Integration with Electron App

The MCP Server can be integrated with the Electron application, allowing both to run simultaneously and communicate through IPC.

```mermaid
sequenceDiagram
participant ElectronApp
participant MCPServer
participant IPC
ElectronApp->>IPC : mcp : start-server
IPC->>MCPServer : Start server process
MCPServer-->>IPC : Server started
IPC-->>ElectronApp : Success response
ElectronApp->>MCPServer : HTTP requests
MCPServer-->>ElectronApp : API responses
ElectronApp->>IPC : mcp : stop-server
IPC->>MCPServer : Stop server process
MCPServer-->>IPC : Server stopped
IPC-->>ElectronApp : Success response
```

**Diagram sources**
- [mcp.ts](file://src/main/ipc/mcp.ts#L1-L150)

**Section sources**
- [mcp.ts](file://src/main/ipc/mcp.ts#L1-L150)

## Future Enhancements

The MCP Server architecture is designed to support future enhancements that will expand its capabilities and integration options.

### Planned Features

```mermaid
graph TD
A[MCP Server] --> B[WebSocket Support]
A --> C[GraphQL API]
A --> D[Webhooks]
A --> E[Real-time Updates]
A --> F[Enhanced Analytics]
B --> G[Live data streaming]
C --> H[Flexible querying]
D --> I[External notifications]
E --> J[Live dashboard updates]
F --> K[Advanced insights]
```

## Security Considerations

The MCP Server implements multiple security measures to protect data and prevent abuse.

### Security Architecture

```mermaid
graph TD
A[Client Request] --> B[Network Level]
B --> C[localhost binding]
A --> D[Transport Level]
D --> E[HTTPS (future)]
A --> F[Application Level]
F --> G[API Key Authentication]
F --> H[Rate Limiting]
F --> I[CORS Protection]
F --> J[Input Validation]
F --> K[SQL Injection Prevention]
G --> L[Secure headers]
H --> M[Request tracking]
I --> N[Origin validation]
J --> O[Zod schemas]
K --> P[Parameterized queries]
```

**Section sources**
- [auth.ts](file://src/server/middleware/auth.ts#L1-L25)
- [rateLimiter.ts](file://src/server/middleware/rateLimiter.ts#L1-L69)
- [tasksRepo.ts](file://src/database/tasksRepo.ts#L1-L199)
- [mcp.md](file://AI/mcp.md#L354-L390)