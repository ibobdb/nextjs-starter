import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { Prisma } from '@prisma/client';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const guard = await apiGuard(['super_admin', 'admin', 'team.write']);
    if (guard.error) return guard.error;

    const body = await request.json();
    const { name, description } = body;

    const team = await prisma.team.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
      },
    });

    return NextResponse.json({ success: true, data: team });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 });
    }
    console.error('[TEAMS_PUT_ERROR]', error);
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
  try {
    const { id } = await params;
    const guard = await apiGuard(['super_admin', 'admin', 'team.write']);
    if (guard.error) return guard.error;

    await prisma.team.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Team deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 });
    }
    console.error('[TEAMS_DELETE_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
