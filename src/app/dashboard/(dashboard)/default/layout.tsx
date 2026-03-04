import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Overview',
};

export default function DefaultDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
