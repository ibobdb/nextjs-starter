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
import { cn } from '@/lib/utils';
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
      <SidebarHeader
        className={cn(
          'border-b border-border transition-all duration-300 ease-in-out',
          isCollapsed ? 'p-0 py-4 flex items-center justify-center' : 'p-4'
        )}
      >
        <div
          className={cn(
            'flex items-center justify-center transition-all duration-300 ease-in-out',
            isCollapsed ? 'w-full' : 'gap-3 pl-1 w-full justify-start'
          )}
        >
          {isCollapsed ? (
            <Image src="/favicon.png" alt="Logo" width={20} height={20} className="shrink-0 object-contain" />
          ) : (
            <>
              <Image src="/favicon.png" alt="Logo" width={24} height={24} className="shrink-0 object-contain" />
              <span className="font-bold text-primary tracking-widest truncate text-lg">
                {appName.toUpperCase()}
              </span>
            </>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className={cn('transition-all duration-300 ease-in-out', isCollapsed && 'px-0')}>
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
            <SidebarGroup
              key={group.id}
              className={cn('transition-all duration-300 ease-in-out', isCollapsed && 'px-0')}
            >
              {!isCollapsed && (
                <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/80 px-3 flex justify-between items-center uppercase tracking-wider">
                  {group.title}
                </SidebarGroupLabel>
              )}

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
                          tooltip={isCollapsed ? (item.title || undefined) : undefined}
                          className={cn(
                            'flex items-center gap-3 rounded-md transition-colors',
                            isCollapsed
                              ? 'justify-center px-0 py-2.5 mx-auto w-fit hover:bg-transparent'
                              : 'justify-between px-3 py-2',
                            active
                              ? 'bg-accent text-accent-foreground font-medium'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                          )}
                        >
                          <Link
                            href={item.url || '#'}
                            prefetch={false}
                            className={cn(
                              'flex items-center',
                              isCollapsed
                                ? 'justify-center w-full'
                                : 'w-full justify-between'
                            )}
                          >
                            <div
                              className={cn(
                                'flex items-center transition-all duration-300 ease-in-out',
                                isCollapsed ? '' : 'gap-3'
                              )}
                            >
                              <Icon size={18} className="shrink-0" />
                              {!isCollapsed && <span>{item.title}</span>}
                            </div>
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

      <SidebarFooter
        className={cn(
          'mt-auto border-t border-border transition-all duration-300 ease-in-out',
          isCollapsed ? 'p-0 py-4 flex items-center justify-center' : 'p-4'
        )}
      >
        <SystemStatus isCollapsed={isCollapsed} appName={appName} />
      </SidebarFooter>
    </Sidebar>
  );
}
