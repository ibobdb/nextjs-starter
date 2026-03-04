import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forms Demo',
};

export default function FormsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
