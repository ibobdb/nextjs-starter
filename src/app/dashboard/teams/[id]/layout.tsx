import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team Details',
};

export default function TeamDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
