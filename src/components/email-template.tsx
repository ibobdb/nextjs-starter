import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface VerificationEmailTemplateProps {
  userName: string;
  verificationUrl: string;
}

export function VerificationEmailTemplate({
  userName,
  verificationUrl,
}: VerificationEmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Verifikasi email Anda untuk melanjutkan</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verifikasi Email Anda</Heading>
          <Text style={text}>Halo {userName},</Text>
          <Text style={text}>
            Terima kasih telah mendaftar! Silakan klik tombol di bawah ini untuk
            memverifikasi alamat email Anda:
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={verificationUrl}>
              Verifikasi Email
            </Button>
          </Section>
          <Text style={text}>
            Atau salin dan tempel URL berikut ke browser Anda:
          </Text>
          <Text style={link}>{verificationUrl}</Text>
          <Text style={text}>
            Link ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak membuat
            akun, abaikan email ini.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 8px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#007bff',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const link = {
  color: '#007bff',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  margin: '16px 8px',
};

// app/api/auth/[...all]/route.ts
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
