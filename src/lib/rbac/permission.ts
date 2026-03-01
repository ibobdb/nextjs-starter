import prisma from '@/lib/prisma';
import { getSession } from '../auth-client';

/**
 * Permission — Server-side RBAC helper (DBStudio Base)
 *
 * Digunakan di:
 * - API Routes: Permission.requirePermission('permission.name')
 * - Middleware (proxy.ts): Permission.getRequiredPermission(pathname)
 */
export class Permission {
  static async getUser() {
    const session = await getSession();
    if (!session) return null;
    const user = await prisma.user.findFirst({
      where: { id: session.data?.user.id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!user) return null;

    const permissionList: string[] =
      user.userRoles.flatMap((r) =>
        r.role.rolePermissions.map((p) => p.permission.name)
      ) ?? [];

    return {
      id: user.id,
      email: user.email,
      role: user.userRoles,
      permissions: permissionList,
    };
  }

  static hasPermission(
    user: { permissions: string[] } | null,
    permission: string
  ) {
    if (!user) return false;
    return user.permissions.includes(permission);
  }

  static async requirePermission(permission: string) {
    const user = await this.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }
    if (!user.permissions.includes(permission)) {
      throw new Error('Forbidden');
    }
    return user;
  }

  /**
   * Mengembalikan permission yang dibutuhkan untuk mengakses route tertentu.
   * Urutan prefix: lebih spesifik di atas, lebih umum di bawah.
   * Return null = route terbuka untuk semua user yang sudah login.
   */
  static async getRequiredPermission(pathname: string): Promise<string | null> {
    const permissionMap: { prefix: string; permission: string }[] = [
      // ─── TrendScout ────────────────────────────────────────────────
      { prefix: '/dashboard/trendscout', permission: 'trendscout.read' },

      // ─── User & Access ─────────────────────────────────────────────
      { prefix: '/dashboard/users',  permission: 'user.read' },
      { prefix: '/dashboard/teams',  permission: 'user.read' },
      { prefix: '/dashboard/access', permission: 'user.read' },

      // ─── General Dashboard ─────────────────────────────────────────
      { prefix: '/dashboard/analytics', permission: 'dashboard.read' },
      { prefix: '/dashboard/logs',      permission: 'dashboard.read' },
      { prefix: '/dashboard/settings',  permission: 'dashboard.read' },
    ];

    for (const item of permissionMap) {
      if (pathname.startsWith(item.prefix)) {
        return item.permission;
      }
    }

    // Route dashboard lain yang tidak terdaftar: bisa diakses user login
    return null;
  }

  /**
   * @deprecated Gunakan getRequiredPermission() (typo sudah diperbaiki)
   */
  static async getRequirePermisison(pathname: string): Promise<string | null> {
    return this.getRequiredPermission(pathname);
  }
}

