/**
 * Standard utility for consistent API responses across all Next.js API Routes.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

/**
 * Creates a standard JSON response object body.
 * 
 * @param success Boolean indicating if the operation succeeded.
 * @param meta Message (on success) or Error (on failure).
 * @param data Optional typed data payload.
 */
export function createApiResponse<T>(
  success: boolean,
  meta?: string,
  data?: T
): ApiResponse<T> {
  const response: ApiResponse<T> = { success };

  if (success) {
    if (meta) response.message = meta;
  } else {
    if (meta) response.error = meta;
  }

  if (data !== undefined) {
    response.data = data;
  }

  return response;
}
