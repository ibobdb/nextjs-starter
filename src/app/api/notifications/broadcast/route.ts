import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { NotificationType } from '@prisma/client';
import { eventBus } from '@/lib/events';
import { logger } from '@/lib/logger';

const broadcastLogger = logger;

export async function POST(req: NextRequest) {
  broadcastLogger.debug('POST /api/notifications/broadcast initiated');
  // 1. Guard with required permission
  const guard = await apiGuard('broadcast.create');
  if (guard.error) {
    broadcastLogger.warn('POST /api/notifications/broadcast - Unauthorized access attempt');
    return guard.error;
  }

  try {
    const body = await req.json();
    const { title, message, type, roleIds, actionUrl } = body;

    if (!title || !message || !type) {
      broadcastLogger.warn('POST /api/notifications/broadcast - Missing required fields');
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    let targetUserIds: string[] = [];

    if (roleIds && Array.isArray(roleIds) && roleIds.length > 0) {
      // Get users with specific roles
      const users = await prisma.user.findMany({
        where: {
          userRoles: {
            some: {
              roleId: { in: roleIds }
            }
          }
        },
        select: { id: true }
      });
      targetUserIds = users.map((u: { id: string }) => u.id);
    } else {
      // Get all users
      const users = await prisma.user.findMany({
        select: { id: true }
      });
      targetUserIds = users.map((u: { id: string }) => u.id);
    }

    if (targetUserIds.length === 0) {
      broadcastLogger.info('POST /api/notifications/broadcast - No users found for the selected criteria');
      return NextResponse.json({ success: true, message: 'No users found for the selected criteria', count: 0 });
    }

    // Create notifications for all target users
    const notifications = targetUserIds.map(userId => ({
      userId,
      title,
      message,
      type: type as NotificationType,
      actionUrl: actionUrl || null,
    }));

    await prisma.notification.createMany({
      data: notifications
    });

    // Notify connected clients immediately
    eventBus.emit('system-event', { type: 'broadcast' });

    broadcastLogger.info(`POST /api/notifications/broadcast - Successfully sent broadcast to ${targetUserIds.length} users`);
    return NextResponse.json({ 
      success: true, 
      message: `Broadcast sent to ${targetUserIds.length} users`,
      count: targetUserIds.length 
    });

  } catch (error: unknown) {
    broadcastLogger.error('POST /api/notifications/broadcast - Error sending broadcast', error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Failed to send broadcast' }, { status: 500 });
  }
}
