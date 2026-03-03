import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { TaskStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { logger } from '@/lib/logger';

const taskLogger = logger;

export async function POST(req: Request) {
  taskLogger.debug('POST /api/tasks/trigger initiated');
  const guard = await apiGuard();
  if (guard.error) {
    taskLogger.warn('POST /api/tasks/trigger - Unauthorized access attempt');
    return guard.error;
  }

  const userId = guard.session.user.id;

  try {
    const body = await req.json();
    const { action, title, ...payload } = body;

    if (!action) {
      taskLogger.warn('POST /api/tasks/trigger - Missing action');
      return NextResponse.json({ success: false, message: 'Missing action' }, { status: 400 });
    }

    // 1. Generate unique callback token
    const callbackToken = randomUUID();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BASE_URL || 'http://localhost:3000';
    const callbackUrl = `${appUrl}/api/webhooks/tasks/${callbackToken}`;

    // 2. Create Task in DB (PENDING)
    const task = await prisma.task.create({
      data: {
        userId,
        title: title || `Task: ${action}`,
        status: TaskStatus.PENDING,
        callbackToken,
        metadata: {
          action,
          ...payload
        },
      },
    });

    // NOTE: In a real base project, you would trigger a generic worker or queue here.
    // For now, we'll simulate a local success/failure for testing the async flow.
    
    if (action === 'test-success' || action === 'test-failure') {
        // Update to RUNNING to simulate initiation
        await prisma.task.update({
            where: { id: task.id },
            data: { status: TaskStatus.RUNNING }
        });

        taskLogger.info(`POST /api/tasks/trigger - Successfully initiated task ${task.id} for user ${userId}`);
        return NextResponse.json({ 
            success: true, 
            message: 'Test task successfully initiated', 
            taskId: task.id,
            callbackUrl // Returning this so user can manually trigger the webhook for testing
        }, { status: 202 });
    }

    taskLogger.warn(`POST /api/tasks/trigger - Invalid action: ${action}`);
    return NextResponse.json({ success: false, message: 'Invalid action for base project' }, { status: 400 });

  } catch (error: unknown) {
    taskLogger.error(`POST /api/tasks/trigger - Internal error for user ${userId}`, error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
