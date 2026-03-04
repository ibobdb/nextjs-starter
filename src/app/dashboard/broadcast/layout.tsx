import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Broadcast',
};

export default function BroadcastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
