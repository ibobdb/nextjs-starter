import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { createApiResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { canManageRole } from '@/lib/role-hierarchy';

const accessLogger = logger;

// PUT /api/access/role-permissions/batch
// Replace all permissions for a specific role
export async function PUT(request: NextRequest) {
  accessLogger.debug('PUT /api/access/role-permissions/batch initiated');
  const guard = await apiGuard('user.update');
  if (guard.error) {
    accessLogger.warn('PUT /api/access/role-permissions/batch - Unauthorized access attempt');
    return guard.error;
  }

  const actorRoles = guard.session.user.roles ?? [];

  try {
    const { roleId, permissionIds } = await request.json();
    
    if (!roleId || !Array.isArray(permissionIds)) {
      return NextResponse.json(
        createApiResponse(false, 'roleId and permissionIds array are required'),
        { status: 400 }
      );
    }

    const roleIdNum = Number(roleId);

    // Hierarchy check: can the actor manage the target role?
    const targetRole = await prisma.roles.findUnique({ where: { id: roleIdNum } });
    if (!targetRole) {
      return NextResponse.json(createApiResponse(false, 'Role not found'), { status: 404 });
    }
    if (!canManageRole(actorRoles, targetRole.name)) {
      accessLogger.warn(`PUT /api/access/role-permissions/batch - Actor cannot manage role: ${targetRole.name}`);
      return NextResponse.json(
        createApiResponse(false, `You do not have permission to modify permissions for the '${targetRole.name}' role`),
        { status: 403 }
      );
    }

    // Run in a transaction to ensure atomic replacement
    await prisma.$transaction(async (tx) => {
      // 1. Delete all existing permissions for this role
      await tx.rolePermission.deleteMany({
        where: { roleId: roleIdNum },
      });

      // 2. Insert new permissions if any exist
      if (permissionIds.length > 0) {
        const data = permissionIds.map((permId: number) => ({
          roleId: roleIdNum,
          permissionId: Number(permId),
        }));

        await tx.rolePermission.createMany({
          data,
        });
      }
    });

    accessLogger.info(`PUT /api/access/role-permissions/batch - Successfully updated permissions for role ${roleIdNum}`);
    return NextResponse.json(createApiResponse(true, 'Permissions updated successfully'));
  } catch (error: unknown) {
    accessLogger.error('PUT /api/access/role-permissions/batch - Failed to update permissions', error);
    return NextResponse.json(
      createApiResponse(false, error instanceof Error ? error.message : 'Failed to update role permissions'),
      { status: 500 }
    );
  }
}
