import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { TaskStatus } from '@prisma/client';

export async function GET() {
  const guard = await apiGuard();
  if (guard.error) return guard.error;

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

    console.log(`[TASKS_API] Found ${tasks.length} active tasks for user ${userId}`);
    return NextResponse.json({ success: true, data: tasks });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
