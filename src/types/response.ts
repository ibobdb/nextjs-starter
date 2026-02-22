export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | string[] | unknown;
  status?: number;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Common API Response creator
 */
export const createApiResponse = <T>(
  success: boolean,
  message?: string,
  data?: T,
  error?: unknown,
  status: number = 200
): ApiResponse<T> => ({
  success,
  message,
  data,
  error,
  status,
});
