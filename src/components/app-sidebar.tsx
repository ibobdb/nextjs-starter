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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession } from '@/hooks/use-session';
import { usePermission } from '@/lib/rbac/hooks/usePermission';
import { useRole } from '@/lib/rbac/hooks/useRole';
import { useModules } from '@/hooks/use-modules';
import { Badge } from '@/components/ui/badge';
import type { NavGroup as NavGroupType } from '@/data/nav/types';
import type { ReactNode } from 'react';

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

  if (roleLoading || (group.permission && permLoading)) return null;
  if (!hasRole) return null;
  if (group.permission && !hasPerm) return null;

  return <>{children}</>;
}

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { user, isLoading: sessionLoading } = useSession();
  const { isModuleActive } = useModules();

  const activeSegment = pathname;

  /** Helper: inisial dari nama untuk AvatarFallback */
  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

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
        <div
          className={cn(
            'flex items-center rounded-lg hover:bg-accent transition-colors cursor-pointer',
            isCollapsed ? 'justify-center p-0 w-full' : 'justify-between p-2'
          )}
        >
          <div
            className={cn(
              'flex items-center',
              isCollapsed ? '' : 'gap-3 min-w-0 flex-1'
            )}
          >
            <Avatar
              className={cn('shrink-0', isCollapsed ? 'h-9 w-9' : 'h-8 w-8')}
            >
              <AvatarImage
                src={user?.image ?? ''}
                alt={user?.name ?? 'User'}
              />
              <AvatarFallback className="text-xs font-semibold">
                {sessionLoading ? '…' : getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                {sessionLoading ? (
                  <>
                    <Skeleton className="h-3.5 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-foreground truncate">
                      {user?.name ?? 'Unknown User'}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user?.email ?? ''}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 hover:bg-accent-foreground/10"
            >
              <MoreVertical size={16} />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
