import { Resend } from 'resend';
import { VerificationEmailTemplate } from '@/components/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
      to: [to],
      subject: 'Verifikasi Email Anda',
      react: VerificationEmailTemplate({
        userName,
        verificationUrl,
      }),
    });

    if (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error);
    throw error;
  }
}
