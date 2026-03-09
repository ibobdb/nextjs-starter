export async function sendEmail({
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
  // Validate recipient email
  if (!to || typeof to !== 'string') {
    console.error('Invalid recipient email address:', to);
    throw new Error('Invalid recipient email address');
  }

  try {
    const { sendEmailDirect } = await import('@/lib/mail');
    return await sendEmailDirect({
      to,
      subject,
      html,
      from,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
