# LifeOS MCP Server Implementation Plan

## Overview
This document outlines the plan for implementing a Model Context Protocol (MCP) server for LifeOS that exposes all core functionality via HTTP, enabling AI models and external tools to interact with the application's data and features.

## Architecture

### 1. MCP Server Setup
- **Framework**: Node.js with Express.js
- **Protocol**: HTTP with JSON-RPC 2.0 or REST endpoints
- **Port**: 3000 (configurable via environment variables)
- **Location**: `src/server/mcp-server.ts`
- **Process**: Separate Node.js process or integrated with main process via IPC

### 2. Execution Modes
```
Option A: Separate Server Process
├── Main Electron App (port 9000)
└── MCP Server Process (port 3000)
    ├── Uses same SQLite database
    ├── Shares settings and state
    └── Communicates via database transactions

Option B: Integrated via IPC
├── Main Electron App
├── IPC Bridge to MCP endpoints
└── Express server spawned by main process
```

**Recommended**: Option A (Separate Process) for better stability and concurrent access

### 3. Core Modules & CRUD Operations

#### 3.1 Tasks Module
**Endpoints**:
- `POST /api/tasks/create` - Create new task
- `GET /api/tasks/:id` - Get task details
- `GET /api/tasks/project/:projectId` - List tasks by project
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete/archive task
- `GET /api/tasks/status` - Get all tasks status

**Fields to expose**:
```typescript
{
  id: number;
  projectId: number;
  title: string;
  description?: string;
  status: 'Backlog' | 'To-Do' | 'In Progress' | 'Completed';
  priority?: string;
  estimatedMinutes?: number;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  actualMinutes?: number;
  createdAt: string;
  updatedAt: string;
}
```

**Status Response**:
```typescript
{
  total: number;
  byStatus: {
    backlog: number;
    todo: number;
    inProgress: number;
    completed: number;
  };
  byPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  avgEstimatedMinutes: number;
  avgActualMinutes: number;
  completionRate: number; // percentage
}
```

#### 3.2 Projects Module
**Endpoints**:
- `POST /api/projects/create` - Create project
- `GET /api/projects/:id` - Get project details
- `GET /api/projects` - List all projects
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `PUT /api/projects/:id/reorder` - Reorder projects
- `PUT /api/projects/:id/set-active` - Set active project
- `GET /api/projects/status` - Get all projects status

**Status Response**:
```typescript
{
  total: number;
  activeProjectId: number | null;
  projects: {
    id: number;
    name: string;
    taskCount: number;
    completedCount: number;
    completionRate: number;
    totalEstimatedMinutes: number;
    totalActualMinutes: number;
  }[];
}
```

#### 3.3 Habits Module
**Endpoints**:
- `POST /api/habits/create` - Create habit
- `GET /api/habits/:id` - Get habit details
- `GET /api/habits` - List all habits
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/log` - Log habit completion
- `DELETE /api/habits/:id/log/:date` - Unlog habit
- `GET /api/habits/:id/logs` - Get habit logs
- `GET /api/habits/status` - Get all habits status

**Fields to expose**:
```typescript
{
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  category?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  position: number;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  todayCompleted: boolean;
  todayCount: number;
}
```

**Status Response**:
```typescript
{
  total: number;
  active: number;
  archived: number;
  completedToday: number;
  avgCompletionRate: number;
  bestStreak: number;
  habits: {
    id: number;
    name: string;
    frequency: string;
    currentStreak: number;
    completionRate: number;
    todayCompleted: boolean;
  }[];
}
```

#### 3.4 Notebooks Module
**Endpoints**:
- `POST /api/notebooks/create` - Create notebook
- `GET /api/notebooks/:id` - Get notebook details
- `GET /api/notebooks` - List all notebooks
- `PUT /api/notebooks/:id` - Update notebook
- `DELETE /api/notebooks/:id` - Delete notebook
- `GET /api/notebooks/status` - Get all notebooks status

**Fields to expose**:
```typescript
{
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  noteCount: number;
}
```

**Status Response**:
```typescript
{
  total: number;
  totalNotes: number;
  notebooks: {
    id: number;
    title: string;
    noteCount: number;
    lastUpdated: string;
  }[];
}
```

#### 3.5 Notes Module
**Endpoints**:
- `POST /api/notes/create` - Create note
- `GET /api/notes/:id` - Get note details
- `GET /api/notes/notebook/:notebookId` - List notes in notebook
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `GET /api/notes/search` - Search notes by title/content
- `GET /api/notes/status` - Get all notes status

**Fields to expose**:
```typescript
{
  id: number;
  notebookId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

**Status Response**:
```typescript
{
  total: number;
  byNotebook: {
    notebookId: number;
    count: number;
  }[];
  totalContentLength: number;
  avgNoteLength: number;
}
```

#### 3.6 Q&A Module
**Endpoints**:
- `POST /api/qa/questions/create` - Create question
- `GET /api/qa/questions/:id` - Get question
- `GET /api/qa/questions` - List questions
- `PUT /api/qa/questions/:id` - Update question
- `DELETE /api/qa/questions/:id` - Delete question
- `POST /api/qa/answers/create` - Create answer
- `GET /api/qa/answers/:questionId` - Get answers for question
- `PUT /api/qa/answers/:id` - Update answer
- `DELETE /api/qa/answers/:id` - Delete answer
- `GET /api/qa/status` - Get Q&A status

**Status Response**:
```typescript
{
  totalQuestions: number;
  totalAnswers: number;
  byStatus: {
    unanswered: number;
    inProgress: number;
    answered: number;
  };
  answerRate: number;
  collections: {
    name: string;
    questionCount: number;
  }[];
}
```

#### 3.7 Activities Module
**Endpoints**:
- `GET /api/activities` - List activities
- `GET /api/activities/date/:date` - Get activities by date
- `GET /api/activities/type/:type` - Get activities by type
- `GET /api/activities/status` - Get activity status and metrics

**Status Response**:
```typescript
{
  today: number;
  thisWeek: number;
  thisMonth: number;
  byType: {
    task: number;
    habit: number;
    note: number;
    qa: number;
  };
  streak: number;
  lastActivityAt: string;
  heatmapData: {
    date: string;
    count: number;
  }[];
}
```

#### 3.8 Settings Module
**Endpoints**:
- `GET /api/settings` - Get current settings
- `PUT /api/settings` - Update settings
- `GET /api/settings/theme` - Get theme settings
- `PUT /api/settings/theme` - Update theme

### 4. Global Status Endpoint

**`GET /api/status`** - Comprehensive system status

```typescript
{
  timestamp: string;
  uptime: number;
  version: string;
  modules: {
    tasks: {
      total: number;
      byStatus: {...};
      completionRate: number;
    };
    projects: {
      total: number;
      active: string;
      status: {...};
    };
    habits: {
      total: number;
      active: number;
      completedToday: number;
      status: {...};
    };
    notebooks: {
      total: number;
      notes: number;
      status: {...};
    };
    qa: {
      questions: number;
      answers: number;
      status: {...};
    };
    activities: {
      today: number;
      thisWeek: number;
      streak: number;
      status: {...};
    };
  };
  database: {
    size: number;
    lastBackup?: string;
    healthy: boolean;
  };
}
```

### 5. Authentication & Security

#### 5.1 Authentication Strategy
- **Local-only access**: Bind to `localhost:3000` by default
- **Optional API Key**: `X-API-Key` header for production deployments
- **CORS**: Configurable whitelist for allowed origins
- **Rate limiting**: Prevent abuse (e.g., 100 requests/minute)

#### 5.2 Implementation
```typescript
// Middleware for authentication
middleware.auth = (req, res, next) => {
  if (process.env.MCP_API_KEY) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.MCP_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  next();
};
```

### 6. Error Handling

**Standardized Error Response**:
```typescript
{
  error: {
    code: string; // 'VALIDATION_ERROR', 'NOT_FOUND', 'DATABASE_ERROR', etc.
    message: string;
    details?: any;
  }
}
```

**HTTP Status Codes**:
- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication failed
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate or constraint violation
- `500 Internal Server Error` - Server error

### 7. Implementation Timeline

#### Phase 1: Foundation (Week 1)
- [ ] Create MCP server file structure
- [ ] Setup Express.js server
- [ ] Implement authentication middleware
- [ ] Create error handling framework
- [ ] Setup logging system

#### Phase 2: Core Modules (Week 2)
- [ ] Implement Tasks endpoints
- [ ] Implement Projects endpoints
- [ ] Implement Habits endpoints
- [ ] Create unit tests for each module

#### Phase 3: Additional Modules (Week 3)
- [ ] Implement Notebooks endpoints
- [ ] Implement Notes endpoints
- [ ] Implement Q&A endpoints
- [ ] Implement Activities endpoints

#### Phase 4: Polish & Integration (Week 4)
- [ ] Implement global status endpoint
- [ ] Add comprehensive logging
- [ ] Performance optimization
- [ ] Documentation and examples
- [ ] Integration testing
- [ ] Docker containerization (optional)

### 8. File Structure

```
src/
├── server/
│   ├── mcp-server.ts              # Main server entry point
│   ├── middleware/
│   │   ├── auth.ts                # Authentication middleware
│   │   ├── errorHandler.ts        # Error handling middleware
│   │   └── logging.ts             # Request logging
│   ├── routes/
│   │   ├── tasks.ts               # Task endpoints
│   │   ├── projects.ts            # Project endpoints
│   │   ├── habits.ts              # Habit endpoints
│   │   ├── notebooks.ts           # Notebook endpoints
│   │   ├── notes.ts               # Note endpoints
│   │   ├── qa.ts                  # Q&A endpoints
│   │   ├── activities.ts          # Activity endpoints
│   │   ├── settings.ts            # Settings endpoints
│   │   └── status.ts              # Global status endpoint
│   ├── controllers/
│   │   ├── tasksController.ts
│   │   ├── projectsController.ts
│   │   ├── habitsController.ts
│   │   ├── notebooksController.ts
│   │   ├── notesController.ts
│   │   ├── qaController.ts
│   │   ├── activitiesController.ts
│   │   └── settingsController.ts
│   ├── services/
│   │   ├── taskService.ts
│   │   ├── projectService.ts
│   │   ├── habitService.ts
│   │   ├── notebookService.ts
│   │   ├── noteService.ts
│   │   ├── qaService.ts
│   │   └── activityService.ts
│   └── utils/
│       ├── database.ts            # Database connection
│       ├── logger.ts              # Logging utility
│       └── validators.ts          # Input validation
├── main/
│   └── index.ts                   # Start MCP server (optional)
└── ...existing files...

AI/
└── mcp.md                          # This file
```

### 9. Configuration

**Environment Variables** (`.env`):
```
MCP_SERVER_PORT=3000
MCP_SERVER_HOST=localhost
MCP_API_KEY=optional_api_key
MCP_RATE_LIMIT=100
MCP_LOG_LEVEL=info
DATABASE_PATH=./app.db
```

**package.json scripts**:
```json
{
  "scripts": {
    "mcp:start": "node dist/server/mcp-server.js",
    "mcp:dev": "ts-node src/server/mcp-server.ts",
    "mcp:test": "jest src/server",
    "dev": "concurrently 'npm:dev:vite' 'npm:dev:main' 'npm:mcp:dev'"
  }
}
```

### 10. Integration with Electron App

**Option 1**: Start MCP server when Electron app starts
```typescript
// In src/main/index.ts
import { startMcpServer } from './server/mcp-server';

app.whenReady().then(async () => {
  // Start Electron window
  await createMainWindow();
  
  // Start MCP server
  if (process.env.NODE_ENV !== 'production') {
    void startMcpServer();
  }
});
```

**Option 2**: Run as separate process
```bash
# Terminal 1
npm run dev  # Electron app

# Terminal 2
npm run mcp:start  # MCP server
```

### 11. API Usage Examples

#### Create a Task
```bash
curl -X POST http://localhost:3000/api/tasks/create \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": 1,
    "title": "Implement feature X",
    "description": "Complete implementation",
    "status": "To-Do",
    "estimatedMinutes": 120
  }'
```

#### Get Project Status
```bash
curl http://localhost:3000/api/projects/status
```

#### Log Habit
```bash
curl -X POST http://localhost:3000/api/habits/1/log \
  -H "Content-Type: application/json" \
  -d '{
    "loggedDate": "2024-10-27",
    "count": 1,
    "note": "Completed successfully"
  }'
```

#### Get Global Status
```bash
curl http://localhost:3000/api/status
```

### 12. Testing Strategy

#### Unit Tests
- Test each controller function
- Mock database layer
- Validate error handling

#### Integration Tests
- Test full request/response cycle
- Test database interactions
- Test concurrent access

#### Load Tests
- Simulate multiple concurrent requests
- Monitor performance
- Identify bottlenecks

### 13. Documentation

Create comprehensive API documentation:
- OpenAPI/Swagger specification
- Postman collection
- Code examples for each endpoint
- Error code reference
- Rate limiting information

### 14. Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] GraphQL endpoint option
- [ ] Batch operations endpoint
- [ ] Advanced search and filtering
- [ ] Data export functionality (CSV, JSON)
- [ ] Scheduled task execution
- [ ] Webhooks for events
- [ ] API versioning strategy
- [ ] Caching layer (Redis)
- [ ] Full-text search capabilities

### 15. Security Considerations

1. **Data Validation**: Strict input validation for all endpoints
2. **SQL Injection Prevention**: Use parameterized queries (already done via better-sqlite3)
3. **Rate Limiting**: Prevent abuse
4. **CORS Configuration**: Restrict origins
5. **Logging**: Log all API access for audit trail
6. **Encryption**: Optional TLS/SSL in production
7. **Database Transactions**: Ensure data consistency
8. **Input Sanitization**: Clean user inputs

## Conclusion

This MCP server plan provides a comprehensive, well-structured API for all LifeOS functionality, enabling AI models and external tools to interact with the application seamlessly. The modular architecture allows for incremental implementation and easy maintenance.
