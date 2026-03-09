import { getSystemConfig } from '@/lib/config';
import { logger } from '@/lib/logger';
import type { Resend } from 'resend';

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

export async function sendEmailDirect({
  to,
  subject,
  html,
  from,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const resend = await getResendInstance();
    const defaultFrom = await getSystemConfig('EMAIL_FROM', process.env.EMAIL_FROM || process.env.EMAIL_USER);
    const appName = await getSystemConfig('APP_NAME', process.env.APP_NAME || 'Dashboard');
    
    // Formatting the email so it looks like "APP_NAME <EMAIL_FROM>"
    const formattedDefaultFrom = `${appName} <${defaultFrom as string}>`;
    const finalFrom = from || formattedDefaultFrom;

    mailLogger.info(`Sending email directly from: ${finalFrom} to: ${to}`);

    const { data, error } = await resend.emails.send({
      from: finalFrom,
      to: [to],
      subject,
      html,
    });

    if (error) {
      mailLogger.error('Email sending failed (Direct):', error);
      throw new Error(error.message || 'Failed to send email');
    }

    return { data };
  } catch (error) {
    mailLogger.error('Internal email service error (Direct):', error);
    throw error;
  }
}
