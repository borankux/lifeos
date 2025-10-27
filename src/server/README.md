# LifeOS MCP Server

The Model Context Protocol (MCP) server provides a comprehensive HTTP API for all LifeOS functionality, enabling AI models and external tools to interact with the application seamlessly.

## Features

- **RESTful API**: Clean, predictable endpoints for all modules
- **Authentication**: Optional API key authentication
- **Rate Limiting**: Configurable request limits (default: 100 req/min)
- **CORS Support**: Cross-origin resource sharing
- **Comprehensive Status**: Global and module-specific status endpoints
- **Error Handling**: Standardized error responses

## Quick Start

### Development Mode

```bash
# Start the MCP server in development
npm run mcp:dev
```

### Production Mode

```bash
# Build the server
npm run build:server

# Start the server
npm run mcp:start
```

### With Electron App

The MCP server can run alongside the Electron app:

```bash
# Terminal 1: Run Electron app
npm run dev

# Terminal 2: Run MCP server
npm run mcp:dev
```

## Configuration

Create a `.env` file in the project root (see `.env.example`):

```env
MCP_SERVER_PORT=3000
MCP_SERVER_HOST=localhost
MCP_API_KEY=your_secret_key  # Optional
MCP_RATE_LIMIT=100
MCP_LOG_LEVEL=info
MCP_CORS_ORIGIN=*
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Tasks
- `POST /api/tasks/create` - Create task
- `GET /api/tasks/:id` - Get task by ID
- `GET /api/tasks/project/:projectId` - List tasks by project
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/move` - Move task
- `GET /api/tasks` - Get tasks status

### Projects
- `POST /api/projects/create` - Create project
- `GET /api/projects/:id` - Get project by ID
- `GET /api/projects` - List all projects
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `PUT /api/projects/reorder` - Reorder projects
- `PUT /api/projects/:id/set-active` - Set active project
- `GET /api/projects/status` - Get projects status

### Habits
- `POST /api/habits/create` - Create habit
- `GET /api/habits/:id` - Get habit by ID
- `GET /api/habits` - List all habits
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/log` - Log habit completion
- `DELETE /api/habits/:id/log/:date` - Unlog habit
- `GET /api/habits/:id/logs` - Get habit logs
- `GET /api/habits/status` - Get habits status

### Notebooks
- `POST /api/notebooks/create` - Create notebook
- `GET /api/notebooks/:id` - Get notebook by ID
- `GET /api/notebooks` - List all notebooks
- `PUT /api/notebooks/:id` - Update notebook
- `DELETE /api/notebooks/:id` - Delete notebook
- `GET /api/notebooks/status` - Get notebooks status

### Notes
- `POST /api/notes/create` - Create note
- `GET /api/notes/:id` - Get note by ID
- `GET /api/notes/notebook/:notebookId` - List notes in notebook
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `GET /api/notes/search?q=query` - Search notes
- `GET /api/notes/status` - Get notes status

### Q&A
- `POST /api/qa/collections/create` - Create collection
- `GET /api/qa/collections/:id` - Get collection
- `GET /api/qa/collections` - List collections
- `PUT /api/qa/collections/:id` - Update collection
- `DELETE /api/qa/collections/:id` - Delete collection
- `POST /api/qa/questions/create` - Create question
- `GET /api/qa/questions/:id` - Get question
- `GET /api/qa/questions?collectionId=X` - List questions
- `PUT /api/qa/questions/:id` - Update question
- `DELETE /api/qa/questions/:id` - Delete question
- `POST /api/qa/answers/create` - Create answer
- `GET /api/qa/answers/:questionId` - Get answers
- `PUT /api/qa/answers/:id` - Update answer
- `DELETE /api/qa/answers/:id` - Delete answer
- `GET /api/qa/status` - Get Q&A status

### Activities
- `GET /api/activities` - Get all activities
- `GET /api/activities/date/:date` - Get activities by date
- `GET /api/activities/type/:type` - Get activities by type
- `GET /api/activities/status` - Get activities status

### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update settings
- `GET /api/settings/theme` - Get theme
- `PUT /api/settings/theme` - Update theme

### Global Status
- `GET /api/status` - Comprehensive system status

## Usage Examples

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

### Get Global Status

```bash
curl http://localhost:3000/api/status \
  -H "X-API-Key: your_key"
```

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

### Search Notes

```bash
curl "http://localhost:3000/api/notes/search?q=project" \
  -H "X-API-Key: your_key"
```

## Response Format

### Success Response

```json
{
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

## Error Codes

- `VALIDATION_ERROR` - Invalid request data
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Invalid or missing API key
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error

## Rate Limiting

The server enforces rate limits per IP address:
- Default: 100 requests per minute
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Status Code: `429 Too Many Requests`

## Authentication

If `MCP_API_KEY` is set in environment variables, all requests (except `/health`) must include:

```
X-API-Key: your_api_key_here
```

## Security Considerations

1. **Local-only access**: Bind to `localhost` by default
2. **API Key**: Use strong, unique API keys in production
3. **CORS**: Configure allowed origins appropriately
4. **Rate Limiting**: Prevent abuse
5. **Input Validation**: All inputs validated with Zod schemas
6. **SQL Injection**: Protected via parameterized queries

## Architecture

```
src/server/
├── mcp-server.ts              # Main server entry point
├── middleware/
│   ├── auth.ts                # Authentication middleware
│   ├── errorHandler.ts        # Error handling
│   ├── logging.ts             # Request logging
│   └── rateLimiter.ts         # Rate limiting
├── routes/                    # Route definitions
├── controllers/               # Request handlers
└── utils/
    └── logger.ts              # Logging utility
```

## Development

### Adding New Endpoints

1. Create route file in `src/server/routes/`
2. Create controller file in `src/server/controllers/`
3. Register route in `src/server/mcp-server.ts`
4. Update this README

### Testing

```bash
# Use curl, Postman, or your favorite API client
curl http://localhost:3000/health
```

## Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Verify all dependencies are installed: `npm install`
- Check logs for errors

### Authentication errors
- Verify `X-API-Key` header is set correctly
- Check `.env` file for `MCP_API_KEY` value

### Rate limit errors
- Wait for the rate limit window to reset
- Increase `MCP_RATE_LIMIT` in `.env` if needed

## License

MIT
