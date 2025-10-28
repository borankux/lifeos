# Controller Layer Architecture

<cite>
**Referenced Files in This Document**   
- [activitiesController.ts](file://src/server/controllers/activitiesController.ts)
- [tasksController.ts](file://src/server/controllers/tasksController.ts)
- [projectsController.ts](file://src/server/controllers/projectsController.ts)
- [notebooksController.ts](file://src/server/controllers/notebooksController.ts)
- [settingsController.ts](file://src/server/controllers/settingsController.ts)
- [habitsController.ts](file://src/server/controllers/habitsController.ts)
- [qaController.ts](file://src/server/controllers/qaController.ts)
- [statusController.ts](file://src/server/controllers/statusController.ts)
- [notesController.ts](file://src/server/controllers/notesController.ts)
- [mcp-server.ts](file://src/server/mcp-server.ts)
- [errorHandler.ts](file://src/server/middleware/errorHandler.ts)
- [init.ts](file://src/database/init.ts)
- [activitiesRepo.ts](file://src/database/activitiesRepo.ts)
- [tasksRepo.ts](file://src/database/tasksRepo.ts)
- [projectsRepo.ts](file://src/database/projectsRepo.ts)
- [notebookRepo.ts](file://src/database/notebookRepo.ts)
- [habitsRepo.ts](file://src/database/habitsRepo.ts)
- [qaRepo.ts](file://src/database/qaRepo.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Controller Layer Overview](#controller-layer-overview)
3. [Request Handling Pattern](#request-handling-pattern)
4. [Response Formatting Standards](#response-formatting-standards)
5. [Error Handling and Propagation](#error-handling-and-propagation)
6. [Controller-Repository Interaction](#controller-repository-interaction)
7. [Complex Operations Implementation](#complex-operations-implementation)
8. [Status and Analytics Controllers](#status-and-analytics-controllers)
9. [Best Practices for Controller Development](#best-practices-for-controller-development)
10. [Middleware Integration](#middleware-integration)
11. [Conclusion](#conclusion)

## Introduction
The controller layer in the MCP Server serves as the critical intermediary between API routes and business logic, orchestrating request processing, data transformation, and response generation. This documentation provides a comprehensive analysis of the controller architecture, detailing the consistent patterns used across all controllers for request validation, error handling, and interaction with repository layers. The controllers follow a standardized approach to ensure maintainability, reliability, and consistency in API responses across the application.

## Controller Layer Overview
The controller layer is organized in a modular fashion, with dedicated controllers for each domain entity such as tasks, projects, habits, notebooks, and settings. Each controller exports multiple handler functions that process specific API endpoints, following a consistent pattern of request processing and response generation. The controllers are designed to be lightweight, focusing primarily on request parameter extraction, input validation, service/repository invocation, and response formatting, while delegating complex business logic to repository and service layers.

```mermaid
graph TB
subgraph "API Layer"
Route[Route Handler]
Controller[Controller Function]
end
subgraph "Business Logic Layer"
Repository[Repository/Data Access]
Service[Service Layer]
end
subgraph "Data Layer"
Database[(Database)]
end
Route --> Controller
Controller --> Repository
Repository --> Database
Controller --> Service
Service --> Repository
style Controller fill:#f9f,stroke:#333
```

**Diagram sources**
- [mcp-server.ts](file://src/server/mcp-server.ts#L1-L90)
- [activitiesController.ts](file://src/server/controllers/activitiesController.ts#L1-L110)

**Section sources**
- [mcp-server.ts](file://src/server/mcp-server.ts#L1-L90)
- [activitiesController.ts](file://src/server/controllers/activitiesController.ts#L1-L110)

## Request Handling Pattern
All controllers follow a consistent asynchronous request handling pattern using Express.js middleware signature with Request, Response, and NextFunction parameters. The pattern begins with parameter extraction from request objects (params, query, body), followed by type conversion and validation. Controllers consistently use try-catch blocks to handle synchronous and asynchronous errors, ensuring that all errors are properly propagated to the centralized error handling middleware.

```mermaid
flowchart TD
Start([Request Received]) --> ExtractParams["Extract Parameters<br/>(params, query, body)"]
ExtractParams --> ValidateInput["Validate and Convert Input"]
ValidateInput --> CallRepository["Call Repository/Service"]
CallRepository --> ProcessResult["Process Repository Result"]
ProcessResult --> FormatResponse["Format Success Response"]
FormatResponse --> SendResponse["Send Response"]
ExtractParams --> |Validation Error| HandleError["Handle Validation Error"]
CallRepository --> |Entity Not Found| HandleNotFound["Handle Not Found"]
CallRepository --> |Other Error| HandleException["Catch Exception"]
HandleException --> PropagateError["Propagate to Error Handler"]
PropagateError --> End([Error Response])
SendResponse --> End
style Start fill:#4CAF50,stroke:#333
style End fill:#F44336,stroke:#333
style HandleException fill:#FF9800,stroke:#333
```

**Diagram sources**
- [tasksController.ts](file://src/server/controllers/tasksController.ts#L1-L140)
- [projectsController.ts](file://src/server/controllers/projectsController.ts#L1-L134)

**Section sources**
- [tasksController.ts](file://src/server/controllers/tasksController.ts#L1-L140)
- [projectsController.ts](file://src/server/controllers/projectsController.ts#L1-L134)
- [habitsController.ts](file://src/server/controllers/habitsController.ts#L1-L132)

## Response Formatting Standards
The MCP Server controllers adhere to a standardized response format that wraps all successful responses in a consistent structure with a "data" property containing the payload. This uniform response format simplifies client-side processing and ensures predictable API behavior. For error conditions, controllers rely on the centralized error handling middleware to format responses with appropriate HTTP status codes and structured error objects containing error codes and messages.

```mermaid
classDiagram
class SuccessResponse {
+data : any
+message? : string
+timestamp? : string
}
class ErrorResponse {
+error : ErrorDetail
}
class ErrorDetail {
+code : string
+message : string
+details? : any
}
class Controller {
+getAllActivities(req, res, next)
+createTask(req, res, next)
+updateProject(req, res, next)
+deleteNotebook(req, res, next)
+getHabitsStatus(req, res, next)
}
Controller --> SuccessResponse : "returns on success"
Controller --> ErrorResponse : "triggers on error"
SuccessResponse <|-- TaskResponse
SuccessResponse <|-- ProjectResponse
SuccessResponse <|-- HabitResponse
ErrorResponse <|-- ValidationError
ErrorResponse <|-- NotFoundError
class TaskResponse {
+data : Task
}
class ProjectResponse {
+data : Project
}
class HabitResponse {
+data : Habit
}
class ValidationError {
+code : "VALIDATION_ERROR"
}
class NotFoundError {
+code : "NOT_FOUND"
}
```

**Diagram sources**
- [notebooksController.ts](file://src/server/controllers/notebooksController.ts#L1-L89)
- [settingsController.ts](file://src/server/controllers/settingsController.ts#L1-L54)
- [errorHandler.ts](file://src/server/middleware/errorHandler.ts#L1-L70)

**Section sources**
- [notebooksController.ts](file://src/server/controllers/notebooksController.ts#L1-L89)
- [settingsController.ts](file://src/server/controllers/settingsController.ts#L1-L54)

## Error Handling and Propagation
The controller layer implements a robust error handling strategy that distinguishes between expected business logic errors and unexpected system errors. When an entity is not found, controllers return specific 404 responses with structured error objects. For validation errors, controllers either handle them directly or rely on middleware to intercept Zod validation errors. All unhandled exceptions are propagated to the centralized error handling middleware via the next() function, ensuring consistent error response formatting across the application.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Controller as "Controller"
participant Repo as "Repository"
participant ErrorHandler as "Error Handler"
Client->>Controller : API Request
Controller->>Repo : Call Repository Method
alt Success Case
Repo-->>Controller : Return Data
Controller->>Controller : Format Response
Controller-->>Client : 200 OK + Data
else Entity Not Found
Repo-->>Controller : null/undefined
Controller->>Controller : Check Existence
Controller-->>Client : 404 Not Found + Error Object
else Validation Error
Controller->>Controller : Validate Input
Controller-->>Client : 400 Bad Request + Error Details
else System Error
Repo->>Controller : Throw Exception
Controller->>ErrorHandler : next(error)
ErrorHandler->>ErrorHandler : Log Error
ErrorHandler-->>Client : 500 Internal Server Error
end
```

**Diagram sources**
- [tasksController.ts](file://src/server/controllers/tasksController.ts#L1-L140)
- [errorHandler.ts](file://src/server/middleware/errorHandler.ts#L1-L70)
- [qaController.ts](file://src/server/controllers/qaController.ts#L1-L217)

**Section sources**
- [errorHandler.ts](file://src/server/middleware/errorHandler.ts#L1-L70)
- [qaController.ts](file://src/server/controllers/qaController.ts#L1-L217)

## Controller-Repository Interaction
Controllers interact with repository layers through direct function calls, maintaining a clear separation of concerns where controllers handle HTTP-specific concerns while repositories manage data access and persistence logic. The repository pattern allows controllers to remain agnostic of the underlying database implementation, promoting testability and maintainability. Controllers import repository modules and invoke their functions with appropriate parameters, then format the returned data for API responses.

```mermaid
graph TD
A[Controller] --> B[Repository Function]
B --> C{Database Operation}
C --> D[(SQLite Database)]
D --> C
C --> B
B --> A
A --> E[Format Response]
E --> F[Send to Client]
subgraph "Controller Responsibilities"
A
E
F
end
subgraph "Repository Responsibilities"
B
C
D
end
style A fill:#f9f,stroke:#333
style B fill:#bbf,stroke:#333
style D fill:#9f9,stroke:#333
```

**Diagram sources**
- [activitiesController.ts](file://src/server/controllers/activitiesController.ts#L1-L110)
- [activitiesRepo.ts](file://src/database/activitiesRepo.ts#L1-L140)
- [init.ts](file://src/database/init.ts#L1-L150)

**Section sources**
- [activitiesController.ts](file://src/server/controllers/activitiesController.ts#L1-L110)
- [activitiesRepo.ts](file://src/database/activitiesRepo.ts#L1-L140)

## Complex Operations Implementation
Certain controllers implement complex operations that involve multiple data transformations or aggregations. For example, the status controllers calculate metrics such as completion rates, streaks, and statistical summaries by combining data from multiple sources. These operations demonstrate how controllers can orchestrate complex business logic by coordinating calls to multiple repository functions and performing calculations on the aggregated data before formatting the final response.

```mermaid
flowchart TD
A[Get Status Request] --> B[Fetch Raw Data]
B --> C[Calculate Completion Rate]
B --> D[Calculate Streak]
B --> E[Aggregate Statistics]
C --> F[Compile Status Object]
D --> F
E --> F
F --> G[Format Response]
G --> H[Send Status Data]
subgraph "Data Sources"
B1[Database Query]
B2[Repository Call]
B3[Service Method]
end
B --> B1
B --> B2
B --> B3
style F fill:#ffcc00,stroke:#333
style H fill:#4CAF50,stroke:#333
```

**Diagram sources**
- [statusController.ts](file://src/server/controllers/statusController.ts#L1-L151)
- [projectsController.ts](file://src/server/controllers/projectsController.ts#L1-L134)
- [habitsController.ts](file://src/server/controllers/habitsController.ts#L1-L132)

**Section sources**
- [statusController.ts](file://src/server/controllers/statusController.ts#L1-L151)
- [projectsController.ts](file://src/server/controllers/projectsController.ts#L1-L134)

## Status and Analytics Controllers
The status and analytics controllers represent a specialized category that aggregates data across multiple domains to provide comprehensive system status and performance metrics. These controllers import multiple repository modules and combine their results to create holistic views of the application state. The getGlobalStatus controller, for instance, consolidates information from tasks, projects, habits, notebooks, Q&A, and activities to provide a complete system overview, demonstrating how controllers can serve as data aggregation points for dashboard and monitoring functionality.

```mermaid
classDiagram
class StatusController {
+getGlobalStatus(req, res, next)
+getTasksStatus(req, res, next)
+getProjectsStatus(req, res, next)
+getHabitsStatus(req, res, next)
+getNotebooksStatus(req, res, next)
+getQAStatus(req, res, next)
+getActivitiesStatus(req, res, next)
}
class Repository {
<<interface>>
+getStats() : Stats
+listItems() : Item[]
+getItemCount() : number
}
class TasksRepo {
+getTasksStatus() : TaskStats
}
class ProjectsRepo {
+getProjectsStatus() : ProjectStats
}
class HabitsRepo {
+getHabitStats() : HabitStats
}
class NotebookRepo {
+getNotebookStats() : NotebookStats
}
class QaRepo {
+getQAStats() : QAStats
}
class ActivitiesRepo {
+getActivityStats() : ActivityStats
}
StatusController --> TasksRepo : "uses"
StatusController --> ProjectsRepo : "uses"
StatusController --> HabitsRepo : "uses"
StatusController --> NotebookRepo : "uses"
StatusController --> QaRepo : "uses"
StatusController --> ActivitiesRepo : "uses"
TasksRepo ..|> Repository
ProjectsRepo ..|> Repository
HabitsRepo ..|> Repository
NotebookRepo ..|> Repository
QaRepo ..|> Repository
ActivitiesRepo ..|> Repository
```

**Diagram sources**
- [statusController.ts](file://src/server/controllers/statusController.ts#L1-L151)
- [tasksController.ts](file://src/server/controllers/tasksController.ts#L1-L140)
- [projectsController.ts](file://src/server/controllers/projectsController.ts#L1-L134)

**Section sources**
- [statusController.ts](file://src/server/controllers/statusController.ts#L1-L151)
- [tasksController.ts](file://src/server/controllers/tasksController.ts#L1-L140)

## Best Practices for Controller Development
The MCP Server controller implementation exemplifies several best practices for maintainable and scalable controller development. Controllers are kept focused on their primary responsibilities of request handling and response formatting, avoiding the inclusion of complex business logic. Each controller function is designed to handle a single responsibility, following the single responsibility principle. Error handling is consistent across all controllers, with proper HTTP status codes and structured error responses. The use of TypeScript interfaces and type annotations ensures type safety throughout the controller layer.

```mermaid
flowchart TD
A[Best Practices] --> B[Single Responsibility]
A --> C[Consistent Error Handling]
A --> D[Type Safety]
A --> E[Separation of Concerns]
A --> F[Input Validation]
A --> G[Response Standardization]
A --> H[Proper Status Codes]
A --> I[Middleware Utilization]
A --> J[Repository Abstraction]
B --> K[One function per endpoint]
C --> L[Use error middleware]
D --> M[TypeScript interfaces]
E --> N[Logic in repositories]
F --> O[Validate params/query/body]
G --> P[Uniform response format]
H --> Q[404 for not found]
I --> R[Auth, logging, rate limiting]
J --> S[Repository pattern]
style A fill:#3498db,stroke:#333,color:#fff
style K fill:#e67e22,stroke:#333,color:#fff
style L fill:#e67e22,stroke:#333,color:#fff
style M fill:#e67e22,stroke:#333,color:#fff
style N fill:#e67e22,stroke:#333,color:#fff
style O fill:#e67e22,stroke:#333,color:#fff
style P fill:#e67e22,stroke:#333,color:#fff
style Q fill:#e67e22,stroke:#333,color:#fff
style R fill:#e67e22,stroke:#333,color:#fff
style S fill:#e67e22,stroke:#333,color:#fff
```

**Section sources**
- [settingsController.ts](file://src/server/controllers/settingsController.ts#L1-L54)
- [notesController.ts](file://src/server/controllers/notesController.ts#L1-L120)
- [qaController.ts](file://src/server/controllers/qaController.ts#L1-L217)

## Middleware Integration
Controllers seamlessly integrate with the Express.js middleware pipeline, benefiting from cross-cutting concerns such as authentication, logging, rate limiting, and error handling. The middleware stack is configured in the MCP server initialization, ensuring that all controller endpoints inherit the same security and operational safeguards. This integration allows controllers to focus on business logic while relying on middleware to handle concerns like request validation, security checks, and performance monitoring.

```mermaid
graph TD
A[Client Request] --> B[CORS Middleware]
B --> C[JSON Parsing]
C --> D[Rate Limiter]
D --> E[Auth Middleware]
E --> F[Request Logger]
F --> G[Controller]
G --> H[Error Handler]
H --> I[Client Response]
style B fill:#9c27b0,stroke:#333,color:#fff
style C fill:#9c27b0,stroke:#333,color:#fff
style D fill:#9c27b0,stroke:#333,color:#fff
style E fill:#9c27b0,stroke:#333,color:#fff
style F fill:#9c27b0,stroke:#333,color:#fff
style G fill:#f9f,stroke:#333,color:#fff
style H fill:#9c27b0,stroke:#333,color:#fff
classDef middleware fill:#9c27b0,stroke:#333,color:#fff;
class B,C,D,E,F,H middleware;
```

**Diagram sources**
- [mcp-server.ts](file://src/server/mcp-server.ts#L1-L90)
- [errorHandler.ts](file://src/server/middleware/errorHandler.ts#L1-L70)
- [logging.ts](file://src/server/middleware/logging.ts#L1-L20)

**Section sources**
- [mcp-server.ts](file://src/server/mcp-server.ts#L1-L90)
- [errorHandler.ts](file://src/server/middleware/errorHandler.ts#L1-L70)

## Conclusion
The controller layer architecture in the MCP Server demonstrates a well-structured, maintainable approach to API development with Express.js. By adhering to consistent patterns for request handling, error propagation, and response formatting, the controllers provide a reliable and predictable interface between the client applications and the underlying business logic. The clear separation of concerns between controllers and repositories promotes testability and scalability, while the integration with middleware ensures consistent application of cross-cutting concerns. This architecture enables efficient development of new endpoints while maintaining code quality and system reliability across the application.