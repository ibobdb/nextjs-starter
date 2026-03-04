import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Access Control',
};

export default function AccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
