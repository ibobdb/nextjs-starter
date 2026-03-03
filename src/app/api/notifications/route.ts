import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { logger } from '@/lib/logger';

const notificationLogger = logger;

export async function GET(req: NextRequest) {
  notificationLogger.debug('GET /api/notifications initiated');
  const guard = await apiGuard();
  if (guard.error) {
    notificationLogger.warn('GET /api/notifications - Unauthorized access attempt');
    return guard.error;
  }

  const userId = guard.session.user.id;
  const searchParams = req.nextUrl.searchParams;
  
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const skip = (page - 1) * limit;

  try {
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } })
    ]);

    notificationLogger.info(`GET /api/notifications - Successfully fetched ${notifications.length} notifications for user ${userId}`);
    return NextResponse.json({ 
      success: true, 
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: unknown) {
    notificationLogger.error(`GET /api/notifications - Error fetching for user ${userId}`, error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await apiGuard();
  if (guard.error) return guard.error;

  const userId = guard.session.user.id;

  try {
    const body = await req.json();
    const { id, all } = body;

    if (all) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } else if (id) {
      await prisma.notification.update({
        where: { id, userId },
        data: { isRead: true },
      });
    } else {
      return NextResponse.json({ success: false, message: 'Missing id or all flag' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await apiGuard();
  if (guard.error) return guard.error;

  const userId = guard.session.user.id;

  try {
    const body = await req.json();
    const { id, all } = body;

    if (all) {
      await prisma.notification.deleteMany({
        where: { userId },
      });
    } else if (id) {
      await prisma.notification.delete({
        where: { id, userId },
      });
    } else {
      return NextResponse.json({ success: false, message: 'Missing id or all flag' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
