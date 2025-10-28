import type { ApiResponse } from '../../common/types';
import { databaseAvailable } from '../index';

export function success<T>(data: T): ApiResponse<T> {
  return { ok: true, data };
}

export function successMessage(message: string): ApiResponse<{ message: string }> {
  return { ok: true, data: { message } };
}

export function failure(error: string): ApiResponse<never> {
  return { ok: false, error };
}

export function wrapIpc<T extends (...args: any[]) => any>(handler: T) {
  return async (...args: Parameters<T>): Promise<ApiResponse<Awaited<ReturnType<T>>>> => {
    try {
      // If database is not available and this is a data-dependent operation, return graceful empty response
      if (!databaseAvailable && args[0]?.toString().includes('database')) {
        console.warn('[IPC Warning] Database not available, returning empty response');
        return success([] as any) as ApiResponse<Awaited<ReturnType<T>>>;
      }
      const result = await handler(...args);
      return success(result) as ApiResponse<Awaited<ReturnType<T>>>;
    } catch (error) {
      // If it's a "Database not initialised" error and database is not available, return gracefully
      if (!databaseAvailable && error instanceof Error && error.message.includes('Database not initialised')) {
        console.warn('[IPC Warning] Database not available, returning empty response for handler');
        return success([] as any) as ApiResponse<Awaited<ReturnType<T>>>;
      }
      console.error('[IPC Error]', error);
      return failure(error instanceof Error ? error.message : String(error));
    }
  };
}
