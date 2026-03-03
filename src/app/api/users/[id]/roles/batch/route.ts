import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { createApiResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

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

  try {
    const { roleIds } = await request.json();
    
    if (!Array.isArray(roleIds)) {
      return NextResponse.json(
      createApiResponse(false, 'roleIds array is required'),
        { status: 400 }
      );
    }

    const { id: userId } = await params;

    // Run in a transaction to ensure atomic replacement
    await prisma.$transaction(async (tx) => {
      // 1. Delete all existing roles for this user
      await tx.userRole.deleteMany({
        where: { userId },
      });

      // 2. Insert new roles if any exist
      if (roleIds.length > 0) {
        // Enforce max 1 role per user based on user request "pastikan 1 user hanya 1 role"
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
