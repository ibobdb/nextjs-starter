'use client';

import { Bell, CheckCircle2, XCircle, Info } from 'lucide-react';
import { useNotificationSystem } from '@/lib/notification-package';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export function NotificationCenter() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotificationSystem();

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative cursor-pointer hover:bg-muted/80 transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground border-2 border-background animate-in zoom-in-50 duration-300"
                variant="destructive"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 shadow-xl border-border/50 bg-background/95 backdrop-blur-md">
          <DropdownMenuLabel className="flex items-center justify-between p-4 bg-muted/20">
            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Notifications</span>
            {unreadCount > 0 && (
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 text-[11px] text-primary hover:no-underline font-bold"
                onClick={(e) => {
                  e.preventDefault();
                  markAllAsRead();
                }}
              >
                Mark all as read
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="m-0" />
          
          <ScrollArea className="h-[400px]">
            {/* Notifications Section */}
            <div className="py-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/40">
                  <Bell className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-sm italic">Clear as a bell!</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={cn(
                      "px-4 py-3 flex items-start gap-3 transition-all hover:bg-muted/40 cursor-pointer border-b border-border/40 last:border-0",
                      !notif.isRead && "bg-primary/[0.03]"
                    )}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                  >
                    <div className={cn(
                      "mt-0.5 p-1.5 rounded-xl shrink-0",
                      notif.type === 'SUCCESS' ? "bg-green-500/10 text-green-600" :
                      notif.type === 'ERROR' ? "bg-red-500/10 text-red-600" :
                      notif.type === 'WARNING' ? "bg-orange-500/10 text-orange-600" :
                      "bg-blue-500/10 text-blue-600"
                    )}>
                      {notif.type === 'SUCCESS' ? <CheckCircle2 className="h-4 w-4" /> :
                       notif.type === 'ERROR' ? <XCircle className="h-4 w-4" /> :
                       <Info className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className={cn("text-sm font-semibold leading-tight", !notif.isRead ? "text-foreground" : "text-muted-foreground")}>
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground/60 shrink-0 font-medium">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className={cn("text-xs leading-normal line-clamp-2", !notif.isRead ? "text-muted-foreground" : "text-muted-foreground/60")}>
                        {notif.message}
                      </p>
                      {notif.actionUrl && (
                        <Link 
                          href={notif.actionUrl} 
                          className="text-[10px] text-primary hover:underline font-bold mt-2 inline-block uppercase tracking-wider"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                    {!notif.isRead && (
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0 animate-pulse" />
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          <DropdownMenuSeparator className="m-0" />
          <DropdownMenuItem asChild>
             <Link 
               href="/dashboard/notifications" 
               className="w-full p-3 justify-center text-xs text-primary font-bold shadow-none hover:bg-primary/5 cursor-pointer uppercase tracking-widest transition-colors flex items-center"
             >
               See all history
             </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
