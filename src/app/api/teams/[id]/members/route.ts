import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { createApiResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

const teamLogger = logger;

// GET /api/teams/[id]/members — list members of a team
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  teamLogger.debug(`GET /api/teams/${id}/members initiated`);
  const guard = await apiGuard();
  if (guard.error) return guard.error;

  const actorRoles = guard.session.user.roles ?? [];
  const actorTeams = (guard.session.user as { teams?: { id: string }[] }).teams ?? [];
  const isSuperAdmin = actorRoles.includes('super_admin');
  const isAdmin = actorRoles.includes('admin');
  const isTeamMember = actorTeams.some((t) => t.id === id);

  // Only team members, admin, or super_admin can view team members
  if (!isSuperAdmin && !isAdmin && !isTeamMember) {
    return NextResponse.json(
      createApiResponse(false, 'You are not a member of this team'),
      { status: 403 }
    );
  }

  try {
    const members = await prisma.teamMember.findMany({
      where: { teamId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    teamLogger.error(`GET /api/teams/${id}/members - Error`, error);
    return NextResponse.json(createApiResponse(false, 'Internal Server Error'), { status: 500 });
  }
}

// POST /api/teams/[id]/members — add a user to a team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  teamLogger.debug(`POST /api/teams/${id}/members initiated`);
  const guard = await apiGuard('user.update');
  if (guard.error) return guard.error;

  const actorRoles = guard.session.user.roles ?? [];
  const isSuperAdmin = actorRoles.includes('super_admin');
  const isAdmin = actorRoles.includes('admin');

  if (!isSuperAdmin && !isAdmin) {
    return NextResponse.json(
      createApiResponse(false, 'Only admin or super_admin can manage team members'),
      { status: 403 }
    );
  }

  try {
    const { userId, role = 'MEMBER' } = await request.json();

    if (!userId) {
      return NextResponse.json(createApiResponse(false, 'userId is required'), { status: 400 });
    }

    // Check if user is already a member
    const existing = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: id, userId } },
    });

    if (existing) {
      return NextResponse.json(
        createApiResponse(false, 'User is already a member of this team'),
        { status: 409 }
      );
    }

    const member = await prisma.teamMember.create({
      data: { teamId: id, userId, role },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    teamLogger.info(`POST /api/teams/${id}/members - Added user ${userId}`);
    return NextResponse.json(createApiResponse(true, undefined, member), { status: 201 });
  } catch (error) {
    teamLogger.error(`POST /api/teams/${id}/members - Error`, error);
    return NextResponse.json(createApiResponse(false, 'Internal Server Error'), { status: 500 });
  }
}

// DELETE /api/teams/[id]/members — remove a user from a team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  teamLogger.debug(`DELETE /api/teams/${id}/members initiated`);
  const guard = await apiGuard('user.update');
  if (guard.error) return guard.error;

  const actorRoles = guard.session.user.roles ?? [];
  const isSuperAdmin = actorRoles.includes('super_admin');
  const isAdmin = actorRoles.includes('admin');

  if (!isSuperAdmin && !isAdmin) {
    return NextResponse.json(
      createApiResponse(false, 'Only admin or super_admin can manage team members'),
      { status: 403 }
    );
  }

  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(createApiResponse(false, 'userId is required'), { status: 400 });
    }

    await prisma.teamMember.deleteMany({
      where: { teamId: id, userId },
    });

    teamLogger.info(`DELETE /api/teams/${id}/members - Removed user ${userId}`);
    return NextResponse.json(createApiResponse(true, 'Member removed successfully'));
  } catch (error) {
    teamLogger.error(`DELETE /api/teams/${id}/members - Error`, error);
    return NextResponse.json(createApiResponse(false, 'Internal Server Error'), { status: 500 });
  }
}
