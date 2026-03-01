import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import tsWorkerAxios from '@/services/ts-worker/ts.worker.axios.config';
import { TaskStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const guard = await apiGuard();
  if (guard.error) return guard.error;

  const userId = guard.session.user.id;

  try {
    const body = await req.json();
    const { action, candidateId, title, ...payload } = body;

    const isTestAction = ['test-success', 'test-failure'].includes(action);

    if (!action || (!candidateId && !isTestAction)) {
      return NextResponse.json({ success: false, message: 'Missing action or candidateId' }, { status: 400 });
    }

    const effectiveCandidateId = candidateId || 'test-system';

    // 1. Generate unique callback token
    const callbackToken = randomUUID();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BASE_URL || 'http://localhost:3000';
    const callbackUrl = `${appUrl}/api/webhooks/tasks/${callbackToken}`;

    // 2. Create Task in DB (PENDING)
    const task = await prisma.task.create({
      data: {
        userId,
        title: title || `Task: ${action} for ${effectiveCandidateId}`,
        status: TaskStatus.PENDING,
        callbackToken,
        metadata: {
          action,
          candidateId: effectiveCandidateId,
          actionUrl: isTestAction ? null : `/dashboard/trendscout/topic-trends/${effectiveCandidateId}`
        },
      },
    });

    // 3. Determine worker endpoint
    let workerEndpoint = '';
    const baseWorkerUrl = `/api/topics/candidates/${effectiveCandidateId}`;
    switch (action) {
      case 'generate-content':
        workerEndpoint = `${baseWorkerUrl}/generate-content`;
        break;
      case 'generate-brief':
        workerEndpoint = `${baseWorkerUrl}/generate-brief`;
        break;
      case 'approve':
        workerEndpoint = `/api/topics/approve/${effectiveCandidateId}`;
        break;
      case 'create-variant':
        workerEndpoint = `${baseWorkerUrl}/variants`;
        break;
      case 'run-clustering':
        workerEndpoint = '/api/topics/run-clustering';
        break;
      case 'test-success':
        workerEndpoint = '/api/test/callback-success';
        break;
      case 'test-failure':
        workerEndpoint = '/api/test/callback-failure';
        break;
      default:
        // Clean up task if action invalid
        await prisma.task.delete({ where: { id: task.id } });
        return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }

    // 4. Call worker with callbackUrl
    try {
      // Use any to avoid complex worker response typing for now
      const workerResponse: any = await tsWorkerAxios.post(workerEndpoint, {
        ...payload,
        callbackUrl
      });

      // Worker might return data in different shapes depending on axios interceptor
      const data = workerResponse.data || workerResponse;
      const jobId = data?.jobId || data?.id;

      // 5. Update Task with externalJobId and status = RUNNING
      await prisma.task.update({
        where: { id: task.id },
        data: {
          status: TaskStatus.RUNNING,
          externalJobId: jobId ? String(jobId) : null,
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Task successfully initiated', 
        taskId: task.id, 
        jobId 
      }, { status: 202 });

    } catch (workerError: any) {
      console.error("[WORKER_TRIGGER_ERROR]:", workerError);
      
      // Update task as FAILED
      await prisma.task.update({
        where: { id: task.id },
        data: {
          status: TaskStatus.FAILED,
          metadata: {
            ...(task.metadata as any),
            error: workerError.response?.data?.message || workerError.message || 'Worker communication error'
          }
        }
      });
      
      return NextResponse.json({ 
        success: false, 
        message: 'Worker returned an error', 
        error: workerError.message 
      }, { status: 502 });
    }

  } catch (error: any) {
    console.error("[TRIGGER_API_ERROR]:", error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
