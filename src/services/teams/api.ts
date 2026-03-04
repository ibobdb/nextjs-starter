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

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface TeamPermission {
  id: number;
  name: string;
  module: string;
  description: string;
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

  // Members
  getMembers(teamId: string): Promise<ApiResponse<TeamMember[]>> {
    return fetch(`/api/teams/${teamId}/members`).then(handleRes<ApiResponse<TeamMember[]>>);
  },

  addMember(teamId: string, userId: string, role = 'MEMBER'): Promise<ApiResponse<TeamMember>> {
    return fetch(`/api/teams/${teamId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    }).then(handleRes<ApiResponse<TeamMember>>);
  },

  removeMember(teamId: string, userId: string): Promise<ApiResponse<void>> {
    return fetch(`/api/teams/${teamId}/members`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }).then(handleRes<ApiResponse<void>>);
  },

  // Permissions
  getTeamPermissions(teamId: string): Promise<ApiResponse<TeamPermission[]>> {
    return fetch(`/api/teams/${teamId}/permissions`).then(handleRes<ApiResponse<TeamPermission[]>>);
  },

  syncTeamPermissions(teamId: string, permissionIds: number[]): Promise<ApiResponse<void>> {
    return fetch(`/api/teams/${teamId}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissionIds }),
    }).then(handleRes<ApiResponse<void>>);
  },
};
