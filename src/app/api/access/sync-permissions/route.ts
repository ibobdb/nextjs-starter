import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { createApiResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

const accessLogger = logger;

// POST /api/access/sync-permissions
// Assign all existing permissions to the super_admin role.
// Only super_admin can call this endpoint.
export async function POST() {
  accessLogger.debug('POST /api/access/sync-permissions initiated');
  const guard = await apiGuard();
  if (guard.error) return guard.error;

  const actorRoles = guard.session.user.roles ?? [];
  if (!actorRoles.includes('super_admin')) {
    return NextResponse.json(
      createApiResponse(false, 'Only super_admin can sync permissions'),
      { status: 403 }
    );
  }

  try {
    const superAdminRole = await prisma.roles.findUnique({ where: { name: 'super_admin' } });
    if (!superAdminRole) {
      return NextResponse.json(createApiResponse(false, 'super_admin role not found'), { status: 404 });
    }

    const allPermissions = await prisma.permissions.findMany();

    // Upsert all permissions to super_admin (idempotent — safe to run multiple times)
    let added = 0;
    for (const perm of allPermissions) {
      const result = await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      });
      if (result) added++;
    }

    accessLogger.info(`POST /api/access/sync-permissions - Synced ${allPermissions.length} permissions to super_admin`);
    return NextResponse.json(
      createApiResponse(true, `Successfully synced ${allPermissions.length} permissions to super_admin`)
    );
  } catch (error) {
    accessLogger.error('POST /api/access/sync-permissions - Error', error);
    return NextResponse.json(createApiResponse(false, 'Internal Server Error'), { status: 500 });
  }
}
