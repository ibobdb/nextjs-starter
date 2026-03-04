import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Date Pickers Demo',
};

export default function DatePickerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
