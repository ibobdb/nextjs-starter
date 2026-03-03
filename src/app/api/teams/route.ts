import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';

export async function GET() {
  try {
    const guard = await apiGuard(['super_admin', 'admin', 'team.read']);
    if (guard.error) return guard.error;

    // Fetch all teams with their member counts
    const teams = await prisma.team.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: teams });
  } catch (error: unknown) {
    console.error('[TEAMS_GET_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const guard = await apiGuard(['super_admin', 'admin', 'team.write']);
    if (guard.error) return guard.error;

    const body = await request.json();
    const { name, description } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Team name is required' },
        { status: 400 }
      );
    }

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: team }, { status: 201 });
  } catch (error: unknown) {
    console.error('[TEAMS_POST_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
