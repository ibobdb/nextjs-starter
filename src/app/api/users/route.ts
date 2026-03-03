import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { logger } from '@/lib/logger';

const userLogger = logger;

// GET /api/users — list semua users dengan role-nya
export async function GET() {
  userLogger.debug('GET /api/users initiated');
  const guard = await apiGuard('user.read');
  if (guard.error) {
    userLogger.warn('GET /api/users - Unauthorized access attempt');
    return guard.error;
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    userLogger.info(`GET /api/users - Successfully fetched ${users.length} users`);
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    userLogger.error('GET /api/users - Database error', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
