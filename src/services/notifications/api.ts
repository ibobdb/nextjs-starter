/**
 * services/notifications/api.ts — Notifications API client
 */

import { ApiResponse } from '@/lib/api-response';

export interface BroadcastPayload {
  title: string;
  message: string;
  type: string;
  actionUrl?: string;
  roleIds?: number[];
}

export interface BroadcastResponse {
  count: number;
}

async function handleRes<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? json.message ?? 'Request failed');
  return json;
}

export const notificationsApi = {
  sendBroadcast(payload: BroadcastPayload): Promise<ApiResponse<BroadcastResponse>> {
    return fetch('/api/notifications/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleRes<ApiResponse<BroadcastResponse>>);
  },
};
