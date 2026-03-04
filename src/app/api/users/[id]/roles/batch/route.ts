import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { createApiResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { canManageRole, canManageUser } from '@/lib/role-hierarchy';

const userLogger = logger;

// PUT /api/users/[id]/roles/batch
// Replace all roles for a specific user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  userLogger.debug(`PUT /api/users/[id]/roles/batch initiated`);
  const guard = await apiGuard('user.update');
  if (guard.error) {
    userLogger.warn(`PUT /api/users/[id]/roles/batch - Unauthorized access attempt`);
    return guard.error;
  }

  const actorRoles = guard.session.user.roles ?? [];

  try {
    const { roleIds } = await request.json();
    
    if (!Array.isArray(roleIds)) {
      return NextResponse.json(
        createApiResponse(false, 'roleIds array is required'),
        { status: 400 }
      );
    }

    const { id: userId } = await params;

    // Hierarchy check 1: Can the actor manage the target user (their current roles)?
    const currentUserRoleRecords = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    const currentUserRoleNames = currentUserRoleRecords.map((ur) => ur.role.name);

    if (!canManageUser(actorRoles, currentUserRoleNames)) {
      userLogger.warn(`PUT /api/users/${userId}/roles/batch - Actor cannot manage this user (insufficient hierarchy)`);
      return NextResponse.json(
        createApiResponse(false, 'You do not have permission to manage this user\'s roles'),
        { status: 403 }
      );
    }

    // Hierarchy check 2: Can the actor assign each of the requested roles?
    if (roleIds.length > 0) {
      const singleRoleId = Number(roleIds[0]);
      const targetRole = await prisma.roles.findUnique({ where: { id: singleRoleId } });
      
      if (!targetRole) {
        return NextResponse.json(createApiResponse(false, 'Role not found'), { status: 404 });
      }

      if (!canManageRole(actorRoles, targetRole.name)) {
        userLogger.warn(`PUT /api/users/${userId}/roles/batch - Actor cannot assign role: ${targetRole.name}`);
        return NextResponse.json(
          createApiResponse(false, `You do not have permission to assign the '${targetRole.name}' role`),
          { status: 403 }
        );
      }
    }

    // Run in a transaction to ensure atomic replacement
    await prisma.$transaction(async (tx) => {
      // 1. Delete all existing roles for this user
      await tx.userRole.deleteMany({
        where: { userId },
      });

      // 2. Insert new roles if any exist
      if (roleIds.length > 0) {
        // Enforce max 1 role per user
        const singleRoleId = Number(roleIds[0]);
        
        await tx.userRole.create({
          data: {
            userId,
            roleId: singleRoleId,
          },
        });
      }
    });

    userLogger.info(`PUT /api/users/${userId}/roles/batch - Successfully updated roles`);
    return NextResponse.json(createApiResponse(true, 'User roles updated successfully'));
  } catch (error: unknown) {
    userLogger.error(`PUT /api/users/[id]/roles/batch - Failed to update roles`, error);
    return NextResponse.json(
      createApiResponse(false, error instanceof Error ? error.message : 'Failed to update user roles'),
      { status: 500 }
    );
  }
}
