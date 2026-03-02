/**
 * services/tasks/api.ts — Background Tasks API client
 */

import { ApiResponse } from '@/lib/api-response';

export interface TaskTriggerPayload {
  action: string;
  [key: string]: unknown;
}

export interface TaskTriggerResponse {
  jobId: string;
  message: string;
}

async function handleRes<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? json.message ?? 'Request failed');
  return json;
}

export const taskService = {
  triggerTask(data: TaskTriggerPayload): Promise<ApiResponse<TaskTriggerResponse>> {
    return fetch('/api/tasks/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleRes<ApiResponse<TaskTriggerResponse>>);
  },
};
