/**
 * services/teams/api.ts — Teams API client
 */

import { ApiResponse } from '@/lib/api-response';

export interface Team {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
  };
}

async function handleRes<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? json.message ?? 'Request failed');
  return json;
}

export const teamsApi = {
  getTeams(): Promise<ApiResponse<Team[]>> {
    return fetch('/api/teams').then(handleRes<ApiResponse<Team[]>>);
  },

  createTeam(data: { name: string; description: string }): Promise<ApiResponse<Team>> {
    return fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleRes<ApiResponse<Team>>);
  },

  deleteTeam(id: string): Promise<ApiResponse<void>> {
    return fetch(`/api/teams/${id}`, { method: 'DELETE' }).then(
      handleRes<ApiResponse<void>>
    );
  },
};
