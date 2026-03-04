import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Combobox Demo',
};

export default function ComboboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
