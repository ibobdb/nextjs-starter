import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account Settings',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
