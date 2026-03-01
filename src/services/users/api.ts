/**
 * services/users/api.ts — Users API client
 */

import type { Role } from '../access/api';

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  userRoles: {
    id: number;
    userId: string;
    roleId: number;
    role: Role;
  }[];
}

async function handleRes<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Request failed');
  return json;
}

export const usersApi = {
  getUsers(): Promise<{ success: boolean; data: User[] }> {
    return fetch('/api/users').then(handleRes<{ success: boolean; data: User[] }>);
  },

  assignRole(userId: string, roleId: number): Promise<{ success: boolean }> {
    return fetch(`/api/users/${userId}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleId }),
    }).then(handleRes<{ success: boolean }>);
  },

  syncUserRoles(
    userId: string,
    roleIds: number[]
  ): Promise<{ success: boolean }> {
    return fetch(`/api/users/${userId}/roles/batch`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleIds }),
    }).then(handleRes<{ success: boolean }>);
  },
};
