import { eventBus } from '@/lib/events';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;

  const stream = new ReadableStream({
    start(controller) {
      // Send retry instruction so browser reconnects after 10s if dropped
      controller.enqueue('retry: 10000\n\n');

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(': heartbeat\n\n');
        } catch {}
      }, 30000);

      const onEvent = (data: { userId?: string, type: string, [key: string]: unknown }) => {
        // Broadcast to specific user or to everyone if no userId specified
        if (!data.userId || data.userId === userId || data.type === 'broadcast') {
          try {
            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
          } catch (e) {
            console.error('SSE Error Enqueueing', e);
          }
        }
      };

      eventBus.on('system-event', onEvent);

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        eventBus.off('system-event', onEvent);
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
