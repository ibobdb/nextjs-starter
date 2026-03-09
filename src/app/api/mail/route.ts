import 'dotenv/config';
import { NextRequest } from 'next/server';
import { NextRequest } from 'next/server';
import { createApiResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

const mailLogger = logger;

const mailLogger = logger;

export async function POST(request: NextRequest) {
  mailLogger.debug('POST /api/mail initiated');
  try {
    const { to, subject, html, from } = await request.json();

    // Validate required fields
    if (!to || !subject || !html) {
      mailLogger.warn('POST /api/mail - Missing required fields');
      return Response.json(
      createApiResponse(false, 'Missing required fields: to, subject, html'),
        { status: 400 }
      );
    }

    const { sendEmailDirect } = await import('@/lib/mail');
    const result = await sendEmailDirect({ to, subject, html, from });

    mailLogger.info(`POST /api/mail - Successfully sent email to ${to}`);
    return Response.json(result);
  } catch (error) {
    mailLogger.error('POST /api/mail - Internal error', error);
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    return Response.json(createApiResponse(false, errorMsg), { status: 500 });
  }
}
