import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { NotificationType } from '@prisma/client';
import { eventBus } from '@/lib/events';

export async function POST(req: NextRequest) {
  // 1. Basic guard (must be logged in)
  const guard = await apiGuard();
  if (guard.error) return guard.error;

  // 2. Role check (manual for super_admin)
  const user = guard.session.user;
  if (!user.roles.includes('super_admin')) {
    return NextResponse.json(
      { success: false, error: 'Forbidden', message: 'Only super_admin can broadcast' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { title, message, type, roleIds, actionUrl } = body;

    if (!title || !message || !type) {
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

    return NextResponse.json({ 
      success: true, 
      message: `Broadcast sent to ${targetUserIds.length} users`,
      count: targetUserIds.length 
    });

  } catch (error: any) {
    console.error('[BROADCAST_ERROR]', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to send broadcast' }, { status: 500 });
  }
}
