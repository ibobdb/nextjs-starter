import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';

// PUT /api/users/[id]/roles/batch
// Replace all roles for a specific user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await apiGuard('user.update');
  if (guard.error) return guard.error;

  try {
    const { roleIds } = await request.json();
    
    if (!Array.isArray(roleIds)) {
      return NextResponse.json(
        { error: 'roleIds array is required' },
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

    return NextResponse.json({ success: true, message: 'User roles updated successfully' });
  } catch (error: any) {
    console.error('[BATCH_USER_ROLES_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update user roles' },
      { status: 500 }
    );
  }
}
