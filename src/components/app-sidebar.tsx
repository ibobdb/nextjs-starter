'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Home, 
  User2, 
  Users, 
  ShieldCheck, 
  Beaker, 
  Megaphone, 
  Settings,
  HelpCircle,
  type LucideIcon
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import useSWR from 'swr';
import { SystemStatus } from '@/components/system-status';

// Icon Map for Dynamic Menus
const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  User2,
  Users,
  ShieldCheck,
  Beaker,
  Megaphone,
  Settings,
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AppSidebar({ appName = 'DBS' }: { appName?: string }) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const activeSegment = pathname;

  const { data: menus, isLoading } = useSWR('/api/menus', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 300000,
  });

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r bg-background"
    >
      <SidebarHeader className="border-b border-border py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent cursor-default">
              <Link href="/dashboard" className="flex items-center gap-3">
                <Image src="/favicon.png" alt="Logo" width={24} height={24} className="shrink-0 object-contain" />
                <span className="font-bold text-primary tracking-widest truncate text-lg group-data-[collapsible=icon]:hidden">
                  {appName.toUpperCase()}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-20 pt-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          menus?.map((group: { id: string; title: string; children: Array<{ id: string; title: string; url?: string; icon: string }> }) => (
            <SidebarGroup key={group.id}>
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/80 flex justify-between items-center uppercase tracking-wider group-data-[collapsible=icon]:hidden">
                {group.title}
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu>
                  {group.children?.map((item) => {
                    const Icon = ICON_MAP[item.icon] || HelpCircle;
                    // Exact match or sub-route match (avoid partial string matches like /dashboard/lab catching /dashboard/lab/forms)
                    const active =
                      item.url && (
                        activeSegment === item.url ||
                        (activeSegment.startsWith(item.url + '/') && item.url !== '/dashboard' && item.url !== '/dashboard/lab')
                      );

                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={!!active}
                          tooltip={item.title}
                        >
                          <Link href={item.url || '#'}>
                            <Icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-border p-4 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:py-4">
        <SystemStatus isCollapsed={isCollapsed} appName={appName} />
      </SidebarFooter>
    </Sidebar>
  );
}
