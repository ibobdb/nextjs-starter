import { Resend } from 'resend';
import { VerificationEmailTemplate } from '@/components/email-template';
import { getSystemConfig } from '@/lib/config';
import { logger } from './logger';

const mailLogger = logger;

interface SendVerificationEmailProps {
  to: string;
  verificationUrl: string;
  userName: string;
}

export async function sendVerificationEmail({
  to,
  verificationUrl,
  userName,
}: SendVerificationEmailProps) {
  try {
    const apiKey = await getSystemConfig('RESEND_API_KEY', process.env.RESEND_API_KEY);
    const fromAddress = await getSystemConfig('EMAIL_FROM', process.env.EMAIL_FROM || 'noreply@yourdomain.com');

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured in settings or environment.');
    }

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: fromAddress as string,
      to: [to],
      subject: 'Verifikasi Email Anda',
      react: VerificationEmailTemplate({
        userName,
        verificationUrl,
      }),
    });

    if (error) {
      mailLogger.error('Error sending verification email', error);
      throw new Error('Failed to send verification email');
    }

    mailLogger.info(`Verification email sent successfully to: ${to}`);
    return { success: true, data };
  } catch (error) {
    mailLogger.error(`Error in sendVerificationEmail to ${to}`, error);
    throw error;
  }
}
