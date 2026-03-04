import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Settings',
};

export default function SystemSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
