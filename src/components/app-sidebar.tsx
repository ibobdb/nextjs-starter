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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const activeSegment = pathname
    .split('/')
    .filter(Boolean)
    .slice(0, 2)
    .join('/');

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
        {items.map((group) => (
          <SidebarGroup key={group.label} className={cn(isCollapsed && 'px-0')}>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/80 px-3">
                {group.label}
              </SidebarGroupLabel>
            )}

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const segment = item.url
                    .split('/')
                    .filter(Boolean)
                    .slice(0, 2)
                    .join('/');
                  const active = activeSegment === segment;

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
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
                      {!isCollapsed &&
                        item.subItem &&
                        item.subItem.map((subitem, i) => {
                          return (
                            <DropdownMenu key={i}>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuAction>
                                  <MoreHorizontal />
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent side="right" align="start">
                                <DropdownMenuItem>
                                  <Link href={subitem.url}>
                                    <span>{subitem.title}</span>
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          );
                        })}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
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
                src="https://github.com/ibobdb.png"
                alt="Boby Nugraha"
              />
              <AvatarFallback>BN</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-foreground truncate">
                  Boby Nugraha
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  bobynugraha19@gmail.com
                </span>
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
