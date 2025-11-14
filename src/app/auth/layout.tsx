import { Toaster } from '@/components/ui/sonner';
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex items-center justify-center h-screen bg-background">
      <Toaster />
      {children}
    </main>
  );
}
