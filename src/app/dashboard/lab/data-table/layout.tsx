import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Table Demo',
};

export default function DataTableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
