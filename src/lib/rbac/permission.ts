import prisma from '@/lib/prisma';
import { getSession } from '../auth-client';
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
  static async getRequirePermisison(pathname: string) {
    const permissionMap = [
      { prefix: '/dashboard/default', permission: 'dashboard.read' },
      { prefix: '/dashboard/test', permission: 'dashboard.read' },
      { prefix: '/dashboard/users', permission: 'user.read' },
      { prefix: '/dashboard/products', permission: 'product.read' },
    ];

    for (const item of permissionMap) {
      if (pathname.startsWith(item.prefix)) {
        return item.permission;
      }
    }

    return null;
  }
}
