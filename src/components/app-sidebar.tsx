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
  SidebarMenuAction,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Shell, MoreVertical, MoreHorizontal } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { items } from '@/data/siderbar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePermission } from '@/lib/rbac/hooks/usePermission';
import { useRole } from '@/lib/rbac/hooks/useRole';
import { useModules } from '@/hooks/use-modules';
import { Badge } from '@/components/ui/badge';
import type { NavGroup as NavGroupType } from '@/data/nav/types';
import type { ReactNode } from 'react';
import { SystemStatus } from '@/components/system-status';

/**
 * NavGroupGuard — Cek role DAN permission sekaligus untuk satu nav group.
 * Jika grup punya field permission, user harus memilikinya untuk melihat grup di sidebar.
 */
function NavGroupGuard({
  group,
  children,
}: {
  group: NavGroupType;
  children: ReactNode;
}) {
  const { allowed: hasRole, isLoading: roleLoading } = useRole(group.roles);
  const { allowed: hasPerm, isLoading: permLoading } = usePermission(
    group.permission ?? ''
  );
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  if (roleLoading || (group.permission && permLoading)) {
    return (
      <SidebarGroup className={cn(isCollapsed && 'px-0')}>
        {!isCollapsed && <Skeleton className="h-3 w-20 mb-2 mt-2 mx-3" />}
        <SidebarGroupContent>
          <SidebarMenu>
            {group.items.map((item, i) => (
              <SidebarMenuItem key={i}>
                 <div className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2',
                    isCollapsed ? 'justify-center mx-auto' : ''
                  )}>
                    <Skeleton className={cn("shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
                    {!isCollapsed && <Skeleton className="h-4 w-[70%]" />}
                 </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (!hasRole) return null;
  if (group.permission && !hasPerm) return null;

  return <>{children}</>;
}

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { isModuleActive } = useModules();

  const activeSegment = pathname;

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r bg-background"
    >
      <SidebarHeader
        className={cn(
          'border-b border-border',
          isCollapsed ? 'p-0 py-4 flex items-center justify-center' : 'p-4'
        )}
      >
        <div
          className={cn(
            'flex items-center justify-center',
            isCollapsed ? 'w-full' : 'gap-2'
          )}
        >
          {isCollapsed ? (
            <Shell size={20} className="shrink-0" />
          ) : (
            <span className="font-bold text-foreground truncate space-x-7 text-xl">
              DB STUDIO
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className={cn(isCollapsed && 'px-0')}>
        {items.map((group) => {
          const isGroupActive = group.moduleId ? isModuleActive(group.moduleId) : true;

          return (
          <NavGroupGuard group={group} key={group.label}>
            <SidebarGroup
              key={group.label}
              className={cn(isCollapsed && 'px-0')}
            >
              {!isCollapsed && (
                <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/80 px-3 flex justify-between items-center">
                  {group.label}
                  {!isGroupActive && (
                    <Badge variant="destructive" className="h-4 text-[9px] px-1.5 uppercase leading-none font-semibold">Offline</Badge>
                  )}
                </SidebarGroupLabel>
              )}

              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const active =
                      activeSegment === item.url ||
                      activeSegment.startsWith(item.url + '/');

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={isCollapsed ? item.title : undefined}
                          className={cn(
                            'flex items-center gap-3 rounded-md transition-colors',
                            isCollapsed
                              ? 'justify-center px-0 py-2.5 mx-auto w-fit hover:bg-transparent'
                              : 'justify-between px-3 py-2',
                            active
                              ? 'bg-accent text-accent-foreground font-medium'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                            !isGroupActive && 'opacity-60 pointer-events-none'
                          )}
                        >
                          <Link
                            href={item.url}
                            className={cn(
                              'flex items-center',
                              isCollapsed
                                ? 'justify-center w-full'
                                : 'w-full justify-between'
                            )}
                          >
                            <div
                              className={cn(
                                'flex items-center',
                                isCollapsed ? '' : 'gap-3'
                              )}
                            >
                              <item.icon size={18} className="shrink-0" />
                              {!isCollapsed && <span>{item.title}</span>}
                            </div>
                          </Link>
                        </SidebarMenuButton>

                        {/* ─── SubItem dropdown (satu dropdown untuk semua subItem) ─── */}
                        {!isCollapsed && item.subItem && item.subItem.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <SidebarMenuAction>
                                <MoreHorizontal size={15} />
                              </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="start">
                              {item.subItem.map((subitem) => (
                                <DropdownMenuItem key={subitem.url} asChild>
                                  <Link href={subitem.url}>
                                    {subitem.title}
                                  </Link>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </NavGroupGuard>
        )})}
      </SidebarContent>

      <SidebarFooter
        className={cn(
          'mt-auto border-t border-border',
          isCollapsed ? 'p-0 py-4 flex items-center justify-center' : 'p-4'
        )}
      >
        <SystemStatus isCollapsed={isCollapsed} />
      </SidebarFooter>
    </Sidebar>
  );
}
