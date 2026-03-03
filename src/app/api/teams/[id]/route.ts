import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';

const teamLogger = logger;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  teamLogger.debug(`PUT /api/teams/${id} initiated`);
  try {
    const guard = await apiGuard(['super_admin', 'admin', 'team.write']);
    if (guard.error) {
      teamLogger.warn(`PUT /api/teams/${id} - Unauthorized access attempt`);
      return guard.error;
    }

    const body = await request.json();
    const { name, description } = body;

    const team = await prisma.team.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
      },
    });

    teamLogger.info(`PUT /api/teams/${id} - Successfully updated team: ${team.name}`);
    return NextResponse.json({ success: true, data: team });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      teamLogger.warn(`PUT /api/teams/${id} - Team not found`);
      return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 });
    }
    teamLogger.error(`PUT /api/teams/${id} - Error updating team`, error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  teamLogger.debug(`DELETE /api/teams/${id} initiated`);
  try {
    const guard = await apiGuard(['super_admin', 'admin', 'team.write']);
    if (guard.error) {
      teamLogger.warn(`DELETE /api/teams/${id} - Unauthorized access attempt`);
      return guard.error;
    }

    await prisma.team.delete({
      where: { id },
    });

    teamLogger.info(`DELETE /api/teams/${id} - Successfully deleted team`);
    return NextResponse.json({ success: true, message: 'Team deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      teamLogger.warn(`DELETE /api/teams/${id} - Team not found`);
      return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 });
    }
    teamLogger.error(`DELETE /api/teams/${id} - Error deleting team`, error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
