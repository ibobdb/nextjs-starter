import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dialogs Demo',
};

export default function DialogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
