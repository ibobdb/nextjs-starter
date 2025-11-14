import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { cookies } from 'next/headers';
import { AppNavbar } from '@/components/app-navbar';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <main className="flex flex-col w-full min-h-screen">
          <Toaster />
          <AppNavbar />
          <div className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </ThemeProvider>
  );
}
