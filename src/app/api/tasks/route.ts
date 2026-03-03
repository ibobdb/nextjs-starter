import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { TaskStatus } from '@prisma/client';
import { logger } from '@/lib/logger';

const taskLogger = logger;

export async function GET() {
  taskLogger.debug('GET /api/tasks initiated');
  const guard = await apiGuard();
  if (guard.error) {
    taskLogger.warn('GET /api/tasks - Unauthorized access attempt');
    return guard.error;
  }

  const userId = guard.session.user.id;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        status: {
          in: [TaskStatus.PENDING, TaskStatus.RUNNING],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    taskLogger.info(`GET /api/tasks - Found ${tasks.length} active tasks for user ${userId}`);
    return NextResponse.json({ success: true, data: tasks });
  } catch (error: unknown) {
    taskLogger.error(`GET /api/tasks - Error fetching for user ${userId}`, error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
