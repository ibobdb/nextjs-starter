/**
 * services/access/api.ts — Access Management API client (DBStudio Base)
 * Client-side fetch functions untuk roles, permissions, dan role-permission mapping.
 */

export interface Role {
  id: number;
  name: string;
  _count?: {
    rolePermissions: number;
    userRoles: number;
  };
}

export interface Permission {
  id: number;
  name: string;
  module: string;
  description: string;
}

export interface PermissionsResponse {
  permissions: Permission[];
  grouped: Record<string, Permission[]>;
}

async function handleRes<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Request failed');
  return json;
}

export const accessApi = {
  // ─── Roles ─────────────────────────────────────────────────────────────────

  getRoles(): Promise<{ success: boolean; data: Role[] }> {
    return fetch('/api/access/roles').then(handleRes<{ success: boolean; data: Role[] }>);
  },

  createRole(name: string): Promise<{ success: boolean; data: Role }> {
    return fetch('/api/access/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }).then(handleRes<{ success: boolean; data: Role }>);
  },

  deleteRole(id: number): Promise<{ success: boolean }> {
    return fetch(`/api/access/roles/${id}`, { method: 'DELETE' }).then(handleRes<{ success: boolean }>);
  },

  // ─── Permissions ───────────────────────────────────────────────────────────

  getPermissions(): Promise<{ success: boolean; data: PermissionsResponse }> {
    return fetch('/api/access/permissions').then(handleRes<{ success: boolean; data: PermissionsResponse }>);
  },

  // ─── Role Permissions ──────────────────────────────────────────────────────

  getRolePermissions(roleId: number): Promise<{ success: boolean; data: Permission[] }> {
    return fetch(`/api/access/role-permissions?roleId=${roleId}`).then(handleRes<{ success: boolean; data: Permission[] }>);
  },

  assignPermission(
    roleId: number,
    permissionId: number
  ): Promise<{ success: boolean }> {
    return fetch('/api/access/role-permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleId, permissionId }),
    }).then(handleRes<{ success: boolean }>);
  },

  removePermission(
    roleId: number,
    permissionId: number
  ): Promise<{ success: boolean }> {
    return fetch('/api/access/role-permissions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleId, permissionId }),
    }).then(handleRes<{ success: boolean }>);
  },
};

