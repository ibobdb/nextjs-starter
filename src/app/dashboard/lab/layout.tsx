import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Background Tasks Lab',
};

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
