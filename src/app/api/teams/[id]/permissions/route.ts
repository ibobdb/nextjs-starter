import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { createApiResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

const teamLogger = logger;

// GET /api/teams/[id]/permissions — list permissions assigned to a team
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  teamLogger.debug(`GET /api/teams/${id}/permissions initiated`);
  const guard = await apiGuard();
  if (guard.error) return guard.error;

  try {
    const teamPerms = await prisma.teamPermission.findMany({
      where: { teamId: id },
      include: { permission: true },
    });

    return NextResponse.json({
      success: true,
      data: teamPerms.map((tp) => tp.permission),
    });
  } catch (error) {
    teamLogger.error(`GET /api/teams/${id}/permissions - Error`, error);
    return NextResponse.json(createApiResponse(false, 'Internal Server Error'), { status: 500 });
  }
}

// PUT /api/teams/[id]/permissions — batch sync all permissions for a team
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  teamLogger.debug(`PUT /api/teams/${id}/permissions initiated`);
  const guard = await apiGuard('user.update');
  if (guard.error) return guard.error;

  const actorRoles = guard.session.user.roles ?? [];
  const isSuperAdmin = actorRoles.includes('super_admin');
  const isAdmin = actorRoles.includes('admin');

  if (!isSuperAdmin && !isAdmin) {
    return NextResponse.json(
      createApiResponse(false, 'Only admin or super_admin can manage team permissions'),
      { status: 403 }
    );
  }

  try {
    const { permissionIds } = await request.json();

    if (!Array.isArray(permissionIds)) {
      return NextResponse.json(
        createApiResponse(false, 'permissionIds array is required'),
        { status: 400 }
      );
    }

    // Verify team exists
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      return NextResponse.json(createApiResponse(false, 'Team not found'), { status: 404 });
    }

    // Atomic replacement
    await prisma.$transaction(async (tx) => {
      await tx.teamPermission.deleteMany({ where: { teamId: id } });
      if (permissionIds.length > 0) {
        await tx.teamPermission.createMany({
          data: permissionIds.map((permId: number) => ({
            teamId: id,
            permissionId: Number(permId),
          })),
        });
      }
    });

    teamLogger.info(`PUT /api/teams/${id}/permissions - Updated permissions`);
    return NextResponse.json(createApiResponse(true, 'Team permissions updated successfully'));
  } catch (error) {
    teamLogger.error(`PUT /api/teams/${id}/permissions - Error`, error);
    return NextResponse.json(createApiResponse(false, 'Internal Server Error'), { status: 500 });
  }
}
