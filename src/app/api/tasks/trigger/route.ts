import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { TaskStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const guard = await apiGuard();
  if (guard.error) return guard.error;

  const userId = guard.session.user.id;

  try {
    const body = await req.json();
    const { action, title, ...payload } = body;

    if (!action) {
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

        return NextResponse.json({ 
            success: true, 
            message: 'Test task successfully initiated', 
            taskId: task.id,
            callbackUrl // Returning this so user can manually trigger the webhook for testing
        }, { status: 202 });
    }

    return NextResponse.json({ success: false, message: 'Invalid action for base project' }, { status: 400 });

  } catch (error: any) {
    console.error("[TRIGGER_API_ERROR]:", error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
