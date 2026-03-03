import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createApiResponse } from '@/lib/api-response';
import { apiGuard } from '@/lib/api-guard';
import { logger } from '@/lib/logger';

const userLogger = logger;

// POST /api/users/[id]/roles — assign role ke user
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  userLogger.debug(`POST /api/users/${id}/roles initiated`);
  const guard = await apiGuard('user.update');
  if (guard.error) {
    userLogger.warn(`POST /api/users/${id}/roles - Unauthorized access attempt`);
    return guard.error;
  }

  try {
    const { roleId } = await request.json();
    if (!roleId) {
      userLogger.warn(`POST /api/users/${id}/roles - Missing roleId`);
      return NextResponse.json(createApiResponse(false, 'roleId is required'), { status: 400 });
    }

    // Cek apakah user sudah punya role ini
    const existing = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: id,
          roleId: Number(roleId),
        },
      },
    });

    if (existing) {
      userLogger.warn(`POST /api/users/${id}/roles - User already has role: ${roleId}`);
      return NextResponse.json(
        createApiResponse(false, 'User already has this role'),
        { status: 409 }
      );
    }

    const userRole = await prisma.userRole.create({
      data: {
        userId: id,
        roleId: Number(roleId),
      },
      include: {
        role: true,
      },
    });

    userLogger.info(`POST /api/users/${id}/roles - Successfully assigned role ${userRole.role.name} to user ${id}`);
    return NextResponse.json(createApiResponse(true, undefined, userRole), { status: 201 });
  } catch (error) {
    userLogger.error(`POST /api/users/${id}/roles - Error assigning role`, error);
    return NextResponse.json(createApiResponse(false, 'Internal Server Error'), { status: 500 });
  }
}

// DELETE /api/users/[id]/roles — unassign role dari user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  userLogger.debug(`DELETE /api/users/${id}/roles initiated`);
  const guard = await apiGuard('user.update');
  if (guard.error) {
    userLogger.warn(`DELETE /api/users/${id}/roles - Unauthorized access attempt`);
    return guard.error;
  }

  try {
    const { roleId } = await request.json();
    if (!roleId) {
      userLogger.warn(`DELETE /api/users/${id}/roles - Missing roleId`);
      return NextResponse.json(createApiResponse(false, 'roleId is required'), { status: 400 });
    }

    await prisma.userRole.deleteMany({
      where: {
        userId: id,
        roleId: Number(roleId),
      },
    });

    userLogger.info(`DELETE /api/users/${id}/roles - Successfully unassigned role ${roleId} from user ${id}`);
    return NextResponse.json(createApiResponse(true));
  } catch (error) {
    userLogger.error(`DELETE /api/users/${id}/roles - Error unassigning role`, error);
    return NextResponse.json(createApiResponse(false, 'Internal Server Error'), { status: 500 });
  }
}
