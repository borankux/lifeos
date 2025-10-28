/**
 * SSE (Server-Sent Events) Manager
 * Manages SSE connections and session state for MCP protocol
 */

import { Response } from 'express';
import { randomUUID } from 'crypto';
import { JsonRpcNotification } from './jsonRpc';

// Session data structure
export interface SessionData {
  sessionId: string;
  response: Response;
  connectedAt: Date;
  lastActivity: Date;
  messageQueue: any[];
  metadata?: Record<string, any>;
  heartbeatInterval?: NodeJS.Timeout;
  lastEventId?: number;
}

// SSE event types
export enum SSEEventType {
  Ping = 'ping',
  Endpoint = 'endpoint',
  Notification = 'notification',
  Error = 'error',
}

// In-memory session storage
const sessions = new Map<string, SessionData>();

// Configuration
const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const HEARTBEAT_INTERVAL_MS = 30 * 1000; // 30 seconds
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a new session ID
 */
export function generateSessionId(): string {
  return randomUUID();
}

/**
 * Validate session ID format (UUID)
 */
export function isValidSessionId(sessionId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(sessionId);
}

/**
 * Create a new SSE session
 */
export function createSession(
  sessionId: string,
  response: Response,
  metadata?: Record<string, any>,
): SessionData {
  const session: SessionData = {
    sessionId,
    response,
    connectedAt: new Date(),
    lastActivity: new Date(),
    messageQueue: [],
    metadata,
    lastEventId: 0,
  };

  sessions.set(sessionId, session);

  // Setup SSE response headers
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
    'Mcp-Session-Id': sessionId,
  });

  // Start heartbeat
  startHeartbeat(sessionId);

  // Handle client disconnect
  response.on('close', () => {
    closeSession(sessionId);
  });

  return session;
}

/**
 * Get a session by ID
 */
export function getSession(sessionId: string): SessionData | undefined {
  return sessions.get(sessionId);
}

/**
 * Close a session
 */
export function closeSession(sessionId: string): void {
  const session = sessions.get(sessionId);
  if (!session) {
    return;
  }

  // Stop heartbeat
  if (session.heartbeatInterval) {
    clearInterval(session.heartbeatInterval);
  }

  // Close response if still open
  try {
    if (!session.response.writableEnded) {
      session.response.end();
    }
  } catch (error) {
    // Ignore errors when closing
  }

  // Remove from storage
  sessions.delete(sessionId);
}

/**
 * Send an SSE event to a session
 */
export function sendEvent(
  sessionId: string,
  eventType: SSEEventType,
  data: any,
  eventId?: number,
): boolean {
  const session = sessions.get(sessionId);
  if (!session) {
    return false;
  }

  session.lastActivity = new Date();

  try {
    let message = '';

    // Event ID (for resumable connections)
    if (eventId !== undefined) {
      message += `id: ${eventId}\n`;
      session.lastEventId = eventId;
    }

    // Event type
    message += `event: ${eventType}\n`;

    // Data payload
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    message += `data: ${dataString}\n\n`;

    // Write to response
    if (!session.response.writableEnded) {
      session.response.write(message);
      return true;
    } else {
      closeSession(sessionId);
      return false;
    }
  } catch (error) {
    console.error(`Failed to send SSE event to session ${sessionId}:`, error);
    closeSession(sessionId);
    return false;
  }
}

/**
 * Start heartbeat for a session
 */
function startHeartbeat(sessionId: string): void {
  const session = sessions.get(sessionId);
  if (!session) {
    return;
  }

  // Clear existing heartbeat if any
  if (session.heartbeatInterval) {
    clearInterval(session.heartbeatInterval);
  }

  // Send initial ping
  sendEvent(sessionId, SSEEventType.Ping, {});

  // Setup interval for periodic pings
  session.heartbeatInterval = setInterval(() => {
    const stillActive = sendEvent(sessionId, SSEEventType.Ping, {});
    if (!stillActive) {
      // Session closed, cleanup interval
      if (session.heartbeatInterval) {
        clearInterval(session.heartbeatInterval);
      }
    }
  }, HEARTBEAT_INTERVAL_MS);
}

/**
 * Send notification to a session
 */
export function sendNotification(
  sessionId: string,
  notification: JsonRpcNotification,
): boolean {
  const session = sessions.get(sessionId);
  if (!session) {
    return false;
  }

  const eventId = (session.lastEventId || 0) + 1;
  return sendEvent(sessionId, SSEEventType.Notification, notification, eventId);
}

/**
 * Send endpoint discovery event (for legacy /sse endpoint)
 */
export function sendEndpointDiscovery(sessionId: string, url: string): boolean {
  return sendEvent(sessionId, SSEEventType.Endpoint, { url });
}

/**
 * Send error event
 */
export function sendError(sessionId: string, message: string, code?: string): boolean {
  return sendEvent(sessionId, SSEEventType.Error, { message, code });
}

/**
 * Cleanup stale sessions
 */
function cleanupStaleSessions(): void {
  const now = Date.now();

  for (const [sessionId, session] of sessions.entries()) {
    const inactiveTime = now - session.lastActivity.getTime();

    if (inactiveTime > SESSION_TIMEOUT_MS) {
      console.log(`Cleaning up stale session: ${sessionId} (inactive for ${inactiveTime}ms)`);
      closeSession(sessionId);
    }
  }
}

/**
 * Get all active session IDs
 */
export function getActiveSessions(): string[] {
  return Array.from(sessions.keys());
}

/**
 * Get session count
 */
export function getSessionCount(): number {
  return sessions.size;
}

/**
 * Get session info
 */
export function getSessionInfo(sessionId: string): {
  connectedAt: string;
  lastActivity: string;
  uptime: number;
  messageCount: number;
} | null {
  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }

  const now = Date.now();
  const uptime = now - session.connectedAt.getTime();

  return {
    connectedAt: session.connectedAt.toISOString(),
    lastActivity: session.lastActivity.toISOString(),
    uptime,
    messageCount: session.lastEventId || 0,
  };
}

/**
 * Resume session from last event ID
 * (placeholder for future implementation if message history is needed)
 */
export function resumeSession(sessionId: string, lastEventId: number): any[] {
  const session = sessions.get(sessionId);
  if (!session) {
    return [];
  }

  // For now, just return empty array
  // In a full implementation, you'd keep a message history and replay from lastEventId
  return [];
}

// Start cleanup interval
const cleanupInterval = setInterval(cleanupStaleSessions, CLEANUP_INTERVAL_MS);

// Cleanup on process exit
process.on('SIGTERM', () => {
  clearInterval(cleanupInterval);
  for (const sessionId of sessions.keys()) {
    closeSession(sessionId);
  }
});

process.on('SIGINT', () => {
  clearInterval(cleanupInterval);
  for (const sessionId of sessions.keys()) {
    closeSession(sessionId);
  }
});
