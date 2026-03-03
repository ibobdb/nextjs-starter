import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

const debugLogger = logger;

export async function GET() {
  debugLogger.debug('GET /api/debug/session initiated');
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    // also fetch a raw user to see if it has roles
    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          include: { role: true }
        }
      }
    });

    debugLogger.info(`GET /api/debug/session - Successfully fetched debug data. Session: ${!!session}`);
    return NextResponse.json({
      session,
      dbUsers: users
    });
  } catch (error) {
    debugLogger.error('GET /api/debug/session - Internal error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
