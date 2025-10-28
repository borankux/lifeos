type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const LOG_LEVEL = process.env.MCP_LOG_LEVEL || 'info';

const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

function shouldLog(level: LogLevel): boolean {
  return levels[level] >= levels[LOG_LEVEL as LogLevel];
}

function formatMessage(level: LogLevel, message: string, data?: any): string {
  const timestamp = new Date().toISOString();
  const levelStr = level.toUpperCase().padEnd(5);
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] ${levelStr} ${message}${dataStr}`;
}

function saveToDatabase(level: LogLevel, message: string, data?: any) {
  try {
    // Dynamically import to avoid circular dependencies
    const { addServerLog } = require('../../database/serverLogsRepo');
    addServerLog(level, message, data);
  } catch (error) {
    // Silently fail - don't want logger to crash the app
  }
}

export const logger = {
  debug(message: string, data?: any) {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message, data));
      saveToDatabase('debug', message, data);
    }
  },

  info(message: string, data?: any) {
    if (shouldLog('info')) {
      console.log(formatMessage('info', message, data));
      saveToDatabase('info', message, data);
    }
  },

  warn(message: string, data?: any) {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, data));
      saveToDatabase('warn', message, data);
    }
  },

  error(message: string, data?: any) {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, data));
      saveToDatabase('error', message, data);
    }
  }
};
