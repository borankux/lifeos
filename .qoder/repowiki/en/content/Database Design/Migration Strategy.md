# Migration Strategy

<cite>
**Referenced Files in This Document**   
- [init.ts](file://src/database/init.ts)
- [habitsSchema.ts](file://src/database/habitsSchema.ts)
- [metricsSchema.ts](file://src/database/metricsSchema.ts)
- [notebookSchema.ts](file://src/database/notebookSchema.ts)
- [qaSchema.ts](file://src/database/qaSchema.ts)
- [DATABASE.md](file://AI/DATABASE.md)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
The LifeOS application implements a database migration system to manage schema changes over time. This documentation details how schema evolution is handled through a migration runner in the main process, tracking applied migrations, and ensuring data integrity during upgrades. The system uses SQLite as its database engine and applies migrations incrementally during application startup.

## Project Structure
The database migration system is organized within the `src/database` directory, where schema definitions are separated into dedicated files for different modules. The migration logic is implemented in the `init.ts` file, which serves as the entry point for database initialization and schema management.

```mermaid
graph TB
subgraph "Database Layer"
init[init.ts]
habits[habitsSchema.ts]
metrics[metricsSchema.ts]
notebook[notebookSchema.ts]
qa[qaSchema.ts]
end
init --> habits
init --> metrics
init --> notebook
init --> qa
```

**Diagram sources**
- [init.ts](file://src/database/init.ts#L1-L150)
- [habitsSchema.ts](file://src/database/habitsSchema.ts#L1-L37)
- [metricsSchema.ts](file://src/database/metricsSchema.ts#L1-L104)
- [notebookSchema.ts](file://src/database/notebookSchema.ts#L1-L52)
- [qaSchema.ts](file://src/database/qaSchema.ts#L1-L72)

**Section sources**
- [init.ts](file://src/database/init.ts#L1-L150)
- [AI/DATABASE.md](file://AI/DATABASE.md#L1-L31)

## Core Components
The database migration system consists of several key components that work together to ensure schema consistency across application updates. The core functionality is implemented in the `runMigrations` function within `init.ts`, which applies schema changes in a controlled manner during application startup.

**Section sources**
- [init.ts](file://src/database/init.ts#L44-L148)

## Architecture Overview
The migration architecture follows an incremental approach where schema changes are applied through dedicated schema functions that create or modify database tables. The system does not use a separate migrations directory with timestamped files as suggested in the documentation, but instead manages schema evolution through conditional SQL execution in the main initialization process.

```mermaid
sequenceDiagram
participant App as Application
participant DB as Database
participant Migrator as Migration Runner
App->>Migrator : initDatabase()
Migrator->>DB : getDb()
Migrator->>Migrator : runMigrations()
Migrator->>DB : CREATE TABLE IF NOT EXISTS projects
Migrator->>DB : CREATE TABLE IF NOT EXISTS tasks
Migrator->>DB : ALTER TABLE tasks ADD COLUMN (conditional)
Migrator->>DB : applyMetricsSchema()
Migrator->>DB : applyQASchema()
Migrator->>DB : applyNotebookSchema()
Migrator->>DB : applyHabitsSchema()
Migrator->>DB : CREATE TABLE IF NOT EXISTS mcp_config
Migrator-->>App : Database initialized
```

**Diagram sources**
- [init.ts](file://src/database/init.ts#L44-L148)

## Detailed Component Analysis

### Migration Runner Implementation
The migration runner is implemented within the `runMigrations` function in `init.ts`. It executes a series of SQL statements to create tables and modify existing schemas. The implementation uses a defensive approach by wrapping ALTER TABLE statements in try-catch blocks to handle cases where columns may already exist.

```mermaid
flowchart TD
Start([Application Start]) --> InitDB["initDatabase()"]
InitDB --> CheckDB["Database exists?"]
CheckDB --> |No| CreateDB["Create database file"]
CheckDB --> |Yes| ConnectDB["Connect to database"]
ConnectDB --> ApplyPragma["applyPragma()"]
ApplyPragma --> RunMigrations["runMigrations()"]
RunMigrations --> CreateTables["Create core tables"]
CreateTables --> AddColumns["Add new columns (conditional)"]
AddColumns --> ApplySchemas["Apply module schemas"]
ApplySchemas --> CreateMCP["Create MCP config table"]
CreateMCP --> InitMCP["Initialize MCP config"]
InitMCP --> Complete["Database ready"]
```

**Diagram sources**
- [init.ts](file://src/database/init.ts#L44-L148)

**Section sources**
- [init.ts](file://src/database/init.ts#L44-L148)

### Schema Management Strategy
LifeOS manages schema changes through dedicated schema functions for each module. These functions are called sequentially during the migration process and contain idempotent SQL statements that can be safely executed multiple times.

#### Habits Schema
```mermaid
classDiagram
class applyHabitsSchema {
+applyHabitsSchema(db : Database) : void
}
class habits {
+id : INTEGER
+name : TEXT
+description : TEXT
+icon : TEXT
+color : TEXT
+category : TEXT
+frequency : TEXT
+target_count : INTEGER
+position : INTEGER
+archived_at : TEXT
+created_at : TEXT
+updated_at : TEXT
}
class habit_logs {
+id : INTEGER
+habit_id : INTEGER
+logged_date : TEXT
+count : INTEGER
+note : TEXT
+created_at : TEXT
}
applyHabitsSchema --> habits : "creates"
applyHabitsSchema --> habit_logs : "creates"
habit_logs --> habits : "REFERENCES"
```

**Diagram sources**
- [habitsSchema.ts](file://src/database/habitsSchema.ts#L1-L37)

#### Metrics Schema
```mermaid
classDiagram
class applyMetricsSchema {
+applyMetricsSchema(db : Database) : void
}
class events {
+id : INTEGER
+user_id : TEXT
+ts : TEXT
+type : TEXT
+meta : TEXT
+weight : REAL
+created_at : TEXT
}
class task_states {
+id : INTEGER
+task_id : INTEGER
+from_status : TEXT
+to_status : TEXT
+ts : TEXT
}
class metrics_config {
+user_id : TEXT
+k_a : REAL
+t_target : REAL
+ct_target_days : REAL
+wip_limit : INTEGER
+h_a_days : REAL
+h_e_days : REAL
+window_days : INTEGER
+updated_at : TEXT
}
class daily_aggregates {
+user_id : TEXT
+date : TEXT
+alive_points : REAL
+event_count : INTEGER
+completed_tasks : INTEGER
+wip_avg : REAL
}
applyMetricsSchema --> events : "creates"
applyMetricsSchema --> task_states : "creates"
applyMetricsSchema --> metrics_config : "creates"
applyMetricsSchema --> daily_aggregates : "creates"
task_states --> tasks : "REFERENCES"
```

**Diagram sources**
- [metricsSchema.ts](file://src/database/metricsSchema.ts#L1-L104)

#### Notebook Schema
```mermaid
classDiagram
class applyNotebookSchema {
+applyNotebookSchema(db : Database) : void
}
class notebooks {
+id : INTEGER
+name : TEXT
+description : TEXT
+icon : TEXT
+color : TEXT
+position : INTEGER
+created_at : TEXT
+updated_at : TEXT
}
class notes {
+id : INTEGER
+notebook_id : INTEGER
+title : TEXT
+content : TEXT
+word_count : INTEGER
+tags : TEXT
+is_pinned : BOOLEAN
+position : INTEGER
+created_at : TEXT
+updated_at : TEXT
}
applyNotebookSchema --> notebooks : "creates"
applyNotebookSchema --> notes : "creates"
notes --> notebooks : "REFERENCES"
```

**Diagram sources**
- [notebookSchema.ts](file://src/database/notebookSchema.ts#L1-L52)

#### Q&A Schema
```mermaid
classDiagram
class applyQASchema {
+applyQASchema(db : Database) : void
}
class qa_collections {
+id : INTEGER
+name : TEXT
+description : TEXT
+color : TEXT
+icon : TEXT
+position : INTEGER
+created_at : TEXT
+updated_at : TEXT
}
class qa_questions {
+id : INTEGER
+collection_id : INTEGER
+question : TEXT
+tags : TEXT
+status : TEXT
+position : INTEGER
+created_at : TEXT
+updated_at : TEXT
}
class qa_answers {
+id : INTEGER
+question_id : INTEGER
+content : TEXT
+is_partial : BOOLEAN
+position : INTEGER
+created_at : TEXT
+updated_at : TEXT
}
applyQASchema --> qa_collections : "creates"
applyQASchema --> qa_questions : "creates"
applyQASchema --> qa_answers : "creates"
qa_questions --> qa_collections : "REFERENCES"
qa_answers --> qa_questions : "REFERENCES"
```

**Diagram sources**
- [qaSchema.ts](file://src/database/qaSchema.ts#L1-L72)

## Dependency Analysis
The migration system has a clear dependency hierarchy where the main initialization process depends on individual schema modules. This modular approach allows for independent evolution of different feature areas while maintaining a centralized migration control point.

```mermaid
graph TD
A[init.ts] --> B[habitsSchema.ts]
A --> C[metricsSchema.ts]
A --> D[notebookSchema.ts]
A --> E[qaSchema.ts]
B --> F[Database]
C --> F
D --> F
E --> F
A --> F
```

**Diagram sources**
- [init.ts](file://src/database/init.ts#L1-L150)
- [habitsSchema.ts](file://src/database/habitsSchema.ts#L1-L37)
- [metricsSchema.ts](file://src/database/metricsSchema.ts#L1-L104)
- [notebookSchema.ts](file://src/database/notebookSchema.ts#L1-L52)
- [qaSchema.ts](file://src/database/qaSchema.ts#L1-L72)

**Section sources**
- [init.ts](file://src/database/init.ts#L1-L150)

## Performance Considerations
The migration system is designed to minimize performance impact during application startup. All schema operations use conditional statements (CREATE TABLE IF NOT EXISTS) and error handling to avoid unnecessary work. Indexes are created after table creation to optimize query performance for common access patterns.

## Troubleshooting Guide
When encountering migration-related issues, consider the following:

1. **Column already exists errors**: These are expected and safely handled by try-catch blocks around ALTER TABLE statements.
2. **Foreign key constraint violations**: Ensure foreign_keys pragma is enabled via applyPragma function.
3. **Missing tables**: Verify that all schema functions are called in runMigrations.
4. **Data loss risks**: The current system does not implement rollback functionality, so schema changes should be carefully tested.

**Section sources**
- [init.ts](file://src/database/init.ts#L44-L148)

## Conclusion
The LifeOS database migration system provides a robust mechanism for evolving the application schema over time. By implementing incremental, idempotent schema changes within the application code, it ensures that all users receive the latest database structure when upgrading. While the system does not use timestamped migration files as initially documented, it achieves the same goal through modular schema functions and defensive SQL execution patterns.