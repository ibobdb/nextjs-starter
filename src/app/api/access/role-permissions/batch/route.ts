import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { createApiResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

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

  try {
    const { roleId, permissionIds } = await request.json();
    
    if (!roleId || !Array.isArray(permissionIds)) {
      return NextResponse.json(
        createApiResponse(false, 'roleId and permissionIds array are required'),
        { status: 400 }
      );
    }

    const roleIdNum = Number(roleId);

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
