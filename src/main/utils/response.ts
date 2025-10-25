import type { ApiResponse } from '../../common/types';

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
      const result = await handler(...args);
      return success(result) as ApiResponse<Awaited<ReturnType<T>>>;
    } catch (error) {
      console.error('[IPC Error]', error);
      return failure(error instanceof Error ? error.message : String(error));
    }
  };
}
