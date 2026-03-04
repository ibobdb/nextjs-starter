import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teams Management',
};

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
