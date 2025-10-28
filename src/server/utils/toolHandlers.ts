/**
 * Tool Handler Adapter
 * Maps JSON-RPC method calls to existing REST API endpoints
 */

import * as tasksController from '../controllers/tasksController';
import * as projectsController from '../controllers/projectsController';
import * as habitsController from '../controllers/habitsController';
import * as notebooksController from '../controllers/notebooksController';
import * as notesController from '../controllers/notesController';
import * as qaController from '../controllers/qaController';
import * as activitiesController from '../controllers/activitiesController';
import * as statusController from '../controllers/statusController';
import { JsonRpcErrorCode, createError } from './jsonRpc';
import manifestData from '../../../mcp-manifest.json';

// Type definitions for tool inputs
interface ToolInput {
  [key: string]: any;
}

// Tool handler result
export interface ToolResult {
  success: boolean;
  data?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

/**
 * Get list of available tool names from manifest
 * Includes MCP protocol methods
 */
export function getAvailableTools(): string[] {
  const toolNames = manifestData.tools.map(tool => tool.name);
  // Add MCP protocol methods
  return [
    'initialize',
    'ping',
    'tools/list',
    'resources/list',
    ...toolNames
  ];
}

/**
 * Get input schema for a specific tool
 */
export function getToolSchema(methodName: string): any {
  const tool = manifestData.tools.find(t => t.name === methodName);
  return tool?.inputSchema;
}

/**
 * Execute a tool handler by method name
 */
export async function executeToolHandler(
  methodName: string,
  params: ToolInput,
): Promise<ToolResult> {
  try {
    // Handle MCP protocol methods
    switch (methodName) {
      case 'initialize':
        return await handleInitialize(params);
      case 'ping':
        return await handlePing(params);
      case 'tools/list':
        return await handleToolsList(params);
      case 'resources/list':
        return await handleResourcesList(params);
      
      // Application tool methods
      case 'get_tasks':
        return await handleGetTasks(params);
      case 'create_task':
        return await handleCreateTask(params);
      case 'update_task':
        return await handleUpdateTask(params);
      case 'get_projects':
        return await handleGetProjects(params);
      case 'create_project':
        return await handleCreateProject(params);
      case 'get_habits':
        return await handleGetHabits(params);
      case 'create_habit':
        return await handleCreateHabit(params);
      case 'get_notebooks':
        return await handleGetNotebooks(params);
      case 'create_notebook':
        return await handleCreateNotebook(params);
      case 'create_note':
        return await handleCreateNote(params);
      case 'get_questions':
        return await handleGetQuestions(params);
      case 'create_question':
        return await handleCreateQuestion(params);
      case 'get_activities':
        return await handleGetActivities(params);
      case 'get_stats':
        return await handleGetStats(params);
      default:
        return {
          success: false,
          error: createError(
            JsonRpcErrorCode.MethodNotFound,
            `Unknown method: ${methodName}`,
          ),
        };
    }
  } catch (error: any) {
    return {
      success: false,
      error: createError(
        JsonRpcErrorCode.InternalError,
        error.message || 'Internal server error',
        error.stack,
      ),
    };
  }
}

/**
 * Create mock Express request/response objects for controller invocation
 */
function createMockReqRes(params: ToolInput, pathParams?: Record<string, string>) {
  const req: any = {
    body: params,
    params: pathParams || {},
    query: {},
  };

  let responseData: any = null;
  let statusCode = 200;

  const res: any = {
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (data: any) => {
      responseData = data;
      return res;
    },
  };

  const next = (error?: any) => {
    if (error) {
      throw error;
    }
  };

  return { req, res, next, getResponse: () => ({ data: responseData, status: statusCode }) };
}

// ============================================================================
// Tool Handler Implementations
// ============================================================================

/**
 * MCP Protocol: initialize - Server initialization
 */
async function handleInitialize(params: ToolInput): Promise<ToolResult> {
  return {
    success: true,
    data: {
      protocolVersion: '2025-06-18',
      serverInfo: {
        name: 'LifeOS MCP Server',
        version: '1.0.0',
      },
      capabilities: {
        tools: true,
        resources: true,
        prompts: false,
      },
    },
  };
}

/**
 * MCP Protocol: ping - Health check
 */
async function handlePing(params: ToolInput): Promise<ToolResult> {
  return {
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * MCP Protocol: tools/list - List available tools
 */
async function handleToolsList(params: ToolInput): Promise<ToolResult> {
  return {
    success: true,
    data: {
      tools: manifestData.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    },
  };
}

/**
 * MCP Protocol: resources/list - List available resources
 */
async function handleResourcesList(params: ToolInput): Promise<ToolResult> {
  return {
    success: true,
    data: {
      resources: manifestData.resources || [],
    },
  };
}

/**
 * get_tasks - Get all tasks or filter by status
 */
async function handleGetTasks(params: ToolInput): Promise<ToolResult> {
  try {
    const { req, res, next, getResponse } = createMockReqRes({});
    
    // Map params to query string format
    if (params.status) {
      req.query.status = params.status;
    }
    if (params.project_id) {
      req.query.projectId = params.project_id;
    }
    if (params.limit) {
      req.query.limit = params.limit.toString();
    }

    // Use the project listing endpoint since we need filtering
    const db = require('../../database/init').getDb();
    const tasksRepo = require('../../database/tasksRepo');
    
    let tasks: any[] = [];
    
    if (params.project_id) {
      tasks = tasksRepo.listTasksByProject(parseInt(params.project_id, 10));
    } else {
      // Get all tasks from all projects
      const projectsRepo = require('../../database/projectsRepo');
      const projects = projectsRepo.listProjects({ includeArchived: false });
      
      for (const project of projects) {
        const projectTasks = tasksRepo.listTasksByProject(project.id);
        tasks.push(...projectTasks);
      }
    }
    
    // Apply status filter if specified
    if (params.status) {
      const statusMap: Record<string, string> = {
        'pending': 'To-Do',
        'in_progress': 'In Progress',
        'completed': 'Completed',
      };
      const mappedStatus = statusMap[params.status] || params.status;
      tasks = tasks.filter(t => t.status === mappedStatus);
    }
    
    // Apply limit if specified
    if (params.limit) {
      tasks = tasks.slice(0, params.limit);
    }

    return {
      success: true,
      data: tasks,
    };
  } catch (error: any) {
    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, error.message),
    };
  }
}

/**
 * create_task - Create a new task
 */
async function handleCreateTask(params: ToolInput): Promise<ToolResult> {
  try {
    const { req, res, next, getResponse } = createMockReqRes({
      title: params.title,
      description: params.description,
      projectId: params.project_id ? parseInt(params.project_id, 10) : 1, // Default to project 1
      dueDate: params.due_date,
      priority: params.priority,
    });

    await tasksController.createTask(req, res, next);
    const response = getResponse();

    if (response.status === 201 && response.data?.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, 'Failed to create task'),
    };
  } catch (error: any) {
    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, error.message),
    };
  }
}

/**
 * update_task - Update an existing task
 */
async function handleUpdateTask(params: ToolInput): Promise<ToolResult> {
  try {
    const taskId = params.id;
    if (!taskId) {
      return {
        success: false,
        error: createError(JsonRpcErrorCode.InvalidParams, 'Task ID is required'),
      };
    }

    const updatePayload: any = {};
    if (params.title) updatePayload.title = params.title;
    if (params.status) {
      // Map MCP status to internal status
      const statusMap: Record<string, string> = {
        'pending': 'To-Do',
        'in_progress': 'In Progress',
        'completed': 'Completed',
      };
      updatePayload.status = statusMap[params.status] || params.status;
    }
    if (params.priority) updatePayload.priority = params.priority;

    const { req, res, next, getResponse } = createMockReqRes(updatePayload, { id: taskId });

    await tasksController.updateTask(req, res, next);
    const response = getResponse();

    if (response.data?.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    return {
      success: false,
      error: createError(JsonRpcErrorCode.ResourceNotFound, 'Task not found'),
    };
  } catch (error: any) {
    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, error.message),
    };
  }
}

/**
 * get_projects - Get all projects
 */
async function handleGetProjects(params: ToolInput): Promise<ToolResult> {
  try {
    const { req, res, next, getResponse } = createMockReqRes({});
    
    if (params.limit) {
      req.query.limit = params.limit.toString();
    }

    await projectsController.listProjects(req, res, next);
    const response = getResponse();

    if (response.data?.data) {
      let projects = response.data.data;
      
      // Apply limit if specified
      if (params.limit) {
        projects = projects.slice(0, params.limit);
      }
      
      return {
        success: true,
        data: projects,
      };
    }

    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, 'Failed to fetch projects'),
    };
  } catch (error: any) {
    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, error.message),
    };
  }
}

/**
 * create_project - Create a new project
 */
async function handleCreateProject(params: ToolInput): Promise<ToolResult> {
  try {
    const { req, res, next, getResponse } = createMockReqRes({
      name: params.name,
      description: params.description,
      color: params.color || '#3B82F6', // Default blue
    });

    await projectsController.createProject(req, res, next);
    const response = getResponse();

    if (response.status === 201 && response.data?.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, 'Failed to create project'),
    };
  } catch (error: any) {
    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, error.message),
    };
  }
}

/**
 * get_habits - Get all habits or filter by status
 */
async function handleGetHabits(params: ToolInput): Promise<ToolResult> {
  try {
    const { req, res, next, getResponse } = createMockReqRes({});
    
    // active_only defaults to true in manifest
    const activeOnly = params.active_only !== false;
    req.query.includeArchived = (!activeOnly).toString();

    await habitsController.listHabits(req, res, next);
    const response = getResponse();

    if (response.data?.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, 'Failed to fetch habits'),
    };
  } catch (error: any) {
    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, error.message),
    };
  }
}

/**
 * create_habit - Create a new habit
 */
async function handleCreateHabit(params: ToolInput): Promise<ToolResult> {
  try {
    const { req, res, next, getResponse } = createMockReqRes({
      name: params.name,
      frequency: params.frequency,
      goal: params.goal || 1,
    });

    await habitsController.createHabit(req, res, next);
    const response = getResponse();

    if (response.status === 201 && response.data?.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, 'Failed to create habit'),
    };
  } catch (error: any) {
    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, error.message),
    };
  }
}

/**
 * get_notebooks - Get all notebooks
 */
async function handleGetNotebooks(params: ToolInput): Promise<ToolResult> {
  try {
    const { req, res, next, getResponse } = createMockReqRes({});
    
    if (params.limit) {
      req.query.limit = params.limit.toString();
    }

    await notebooksController.listNotebooks(req, res, next);
    const response = getResponse();

    if (response.data?.data) {
      let notebooks = response.data.data;
      
      // Apply limit if specified
      if (params.limit) {
        notebooks = notebooks.slice(0, params.limit);
      }
      
      return {
        success: true,
        data: notebooks,
      };
    }

    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, 'Failed to fetch notebooks'),
    };
  } catch (error: any) {
    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, error.message),
    };
  }
}

/**
 * create_notebook - Create a new notebook
 */
async function handleCreateNotebook(params: ToolInput): Promise<ToolResult> {
  try {
    const { req, res, next, getResponse } = createMockReqRes({
      title: params.title,
      description: params.description,
    });

    await notebooksController.createNotebook(req, res, next);
    const response = getResponse();

    if (response.status === 201 && response.data?.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, 'Failed to create notebook'),
    };
  } catch (error: any) {
    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, error.message),
    };
  }
}

/**
 * create_note - Create a note in a notebook
 */
async function handleCreateNote(params: ToolInput): Promise<ToolResult> {
  try {
    const { req, res, next, getResponse } = createMockReqRes({
      notebookId: parseInt(params.notebook_id, 10),
      title: params.title,
      content: params.content || '',
    });

    await notesController.createNote(req, res, next);
    const response = getResponse();

    if (response.status === 201 && response.data?.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, 'Failed to create note'),
    };
  } catch (error: any) {
    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, error.message),
    };
  }
}

/**
 * get_questions - Get all Q&A questions
 */
async function handleGetQuestions(params: ToolInput): Promise<ToolResult> {
  try {
    const { req, res, next, getResponse } = createMockReqRes({});
    
    if (params.status) {
      req.query.status = params.status;
    }
    if (params.limit) {
      req.query.limit = params.limit.toString();
    }

    await qaController.listQuestions(req, res, next);
    const response = getResponse();

    if (response.data?.data) {
      let questions = response.data.data;
      
      // Apply limit if specified
      if (params.limit) {
        questions = questions.slice(0, params.limit);
      }
      
      return {
        success: true,
        data: questions,
      };
    }

    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, 'Failed to fetch questions'),
    };
  } catch (error: any) {
    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, error.message),
    };
  }
}

/**
 * create_question - Create a new Q&A question
 */
async function handleCreateQuestion(params: ToolInput): Promise<ToolResult> {
  try {
    const { req, res, next, getResponse } = createMockReqRes({
      question: params.question,
      category: params.category || 'General',
    });

    await qaController.createQuestion(req, res, next);
    const response = getResponse();

    if (response.status === 201 && response.data?.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, 'Failed to create question'),
    };
  } catch (error: any) {
    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, error.message),
    };
  }
}

/**
 * get_activities - Get recent activities
 */
async function handleGetActivities(params: ToolInput): Promise<ToolResult> {
  try {
    const { req, res, next, getResponse } = createMockReqRes({});
    
    if (params.limit) {
      req.query.limit = params.limit.toString();
    }
    if (params.days) {
      req.query.days = params.days.toString();
    }

    await activitiesController.getAllActivities(req, res, next);
    const response = getResponse();

    if (response.data?.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, 'Failed to fetch activities'),
    };
  } catch (error: any) {
    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, error.message),
    };
  }
}

/**
 * get_stats - Get LifeOS statistics and analytics
 */
async function handleGetStats(params: ToolInput): Promise<ToolResult> {
  try {
    const { req, res, next, getResponse } = createMockReqRes({});

    // Route to specific status endpoint based on metric
    switch (params.metric) {
      case 'task_completion':
        await tasksController.getTasksStatus(req, res, next);
        break;
      case 'habit_consistency':
        await habitsController.getHabitsStatus(req, res, next);
        break;
      case 'note_activity':
        await notebooksController.getNotebooksStatus(req, res, next);
        break;
      case 'question_rate':
        await qaController.getQAStatus(req, res, next);
        break;
      default:
        // Get overall status
        await statusController.getGlobalStatus(req, res, next);
    }

    const response = getResponse();

    if (response.data?.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, 'Failed to fetch stats'),
    };
  } catch (error: any) {
    return {
      success: false,
      error: createError(JsonRpcErrorCode.InternalError, error.message),
    };
  }
}
