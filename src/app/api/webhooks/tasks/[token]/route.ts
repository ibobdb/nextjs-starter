import prisma from "@/lib/prisma";
import { NotificationType, TaskStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { eventBus } from "@/lib/events";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    // IP-based Rate Limiting for Webhooks
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown-ip";
    // Strict limit: 60 requests per minute per IP/token combination to prevent spam
    const rl = rateLimit(`webhook_${token}_${ip}`, { limit: 60, windowMs: 60000 });
    if (!rl.isAllowed && rl.response) {
      return rl.response;
    }
    
    // Validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
    }

    const { status, result, error } = body;

    // 1. Find the task by callbackToken
    const task = await prisma.task.findUnique({
      where: { callbackToken: token },
    });

    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });
    }

    // 2. Map status to Prisma TaskStatus
    // Worker sends: 'completed' | 'failed' | 'running' | 'processing'
    let finalStatus: TaskStatus;
    let notificationType: NotificationType = NotificationType.INFO;

    const incomingStatus = (status || "").toLowerCase();

    if (incomingStatus === "completed" || incomingStatus === "success") {
      finalStatus = TaskStatus.COMPLETED;
      notificationType = NotificationType.SUCCESS;
    } else if (incomingStatus === "failed" || incomingStatus === "error") {
      finalStatus = TaskStatus.FAILED;
      notificationType = NotificationType.ERROR;
    } else if (incomingStatus === "running" || incomingStatus === "processing") {
      finalStatus = TaskStatus.RUNNING;
    } else {
      finalStatus = task.status; // No change for unknown status
    }

    // 3. Update task
    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: finalStatus,
        metadata: {
          ...(task.metadata as Record<string, unknown> || {}),
          result: result || null,
          error: error || null,
          lastIncomingStatus: incomingStatus
        },
      },
    });

    // 4. Create Notification if the task is finished
    if (finalStatus === TaskStatus.COMPLETED || finalStatus === TaskStatus.FAILED) {
      await prisma.notification.create({
        data: {
          userId: task.userId,
          title: task.title,
          message: finalStatus === TaskStatus.COMPLETED 
            ? "Proses latar belakang telah selesai dengan sukses." 
            : `Gagal: ${error || "Terjadi kesalahan saat pemrosesan."}`,
          type: notificationType,
          actionUrl: task.metadata && (task.metadata as Record<string, unknown>).actionUrl ? String((task.metadata as Record<string, unknown>).actionUrl) : undefined,
        },
      });

      // Emit SSE to notify client
      eventBus.emit('system-event', { type: 'task-completed', userId: task.userId, taskId: task.id });
    }

    return NextResponse.json({ success: true, status: finalStatus });
  } catch (err: unknown) {
    console.error("[TASK_WEBHOOK_ERROR]:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
