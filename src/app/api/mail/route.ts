import 'dotenv/config';
import { NextRequest } from 'next/server';
import type { Resend } from 'resend';
import { getSystemConfig } from '@/lib/config';
import { createApiResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

const mailLogger = logger;

// Prevent initialization during build time
let resendInstance: { client: Resend; key: string } | null = null;

async function getResendInstance(): Promise<Resend> {
  const apiKey = await getSystemConfig('RESEND_API_KEY', process.env.RESEND_API_KEY);
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable or setting is not set');
  }

  // Re-instantiate if the key changes or is not yet initialized
  if (!resendInstance || resendInstance.key !== apiKey) {
    const { Resend } = await import('resend');
    resendInstance = { client: new Resend(apiKey), key: apiKey };
  }
  return resendInstance.client;
}

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

    const resend = await getResendInstance();
    const defaultFrom = await getSystemConfig('EMAIL_FROM', process.env.EMAIL_FROM || process.env.EMAIL_USER);
    const appName = await getSystemConfig('APP_NAME', process.env.APP_NAME || 'Dashboard');
    
    // Formatting the email so it looks like "APP_NAME <EMAIL_FROM>"
    const formattedDefaultFrom = `${appName} <${defaultFrom as string}>`;

    const { data, error } = await resend.emails.send({
      from: from || formattedDefaultFrom,
      to: [to],
      subject,
      html,
    });

    if (error) {
      mailLogger.error('POST /api/mail - Resend error', error);
      return Response.json(
        createApiResponse(false, error.message || 'Failed to send email'),
        { status: 500 }
      );
    }

    mailLogger.info(`POST /api/mail - Successfully sent email to ${to}`);
    return Response.json({ data });
  } catch (error) {
    mailLogger.error('POST /api/mail - Internal error', error);
    if (error instanceof Error && error.message.includes('RESEND_API_KEY')) {
      return Response.json(
      createApiResponse(false, 'Email service not configured'),
        { status: 500 }
      );
    }

    return Response.json(createApiResponse(false, 'Internal server error'), { status: 500 });
  }
}
