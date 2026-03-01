"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Bell, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Info,
  Trash2,
  Check,
  MoreVertical,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useNotifications } from "@/lib/notification-package/useNotifications";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { 
    notifications, 
    meta, 
    isLoading, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  } = useNotifications(page, 20);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast.success("All notifications marked as read");
  };

  const handleDeleteAll = async () => {
    await deleteAllNotifications();
    toast.success("All notifications history cleared");
    setIsAlertOpen(false);
  };

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    toast.success("Notification deleted");
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Notifications"
          description="View all system alerts and updates across DBStudio."
        />
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="gap-2">
             <Check className="h-4 w-4" />
             Mark All Read
           </Button>
           
           <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
             <AlertDialogTrigger asChild>
               <Button variant="destructive" size="sm" className="gap-2">
                 <Trash2 className="h-4 w-4" />
                 Clear All
               </Button>
             </AlertDialogTrigger>
             <AlertDialogContent>
               <AlertDialogHeader>
                 <AlertDialogTitle>Clear All Notifications?</AlertDialogTitle>
                 <AlertDialogDescription>
                   This action cannot be undone. This will permanently delete your entire notification history from the servers.
                 </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                 <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                   Delete All
                 </AlertDialogAction>
               </AlertDialogFooter>
             </AlertDialogContent>
           </AlertDialog>
        </div>
      </div>


      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-10 w-10 text-muted-foreground/30" />}
          title="No notifications yet"
          description="We'll notify you here when there are updates or task results."
        />
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
          <div className="divide-y divide-border/40">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                className={cn(
                  "p-4 flex items-start gap-4 transition-colors hover:bg-muted/30 group",
                  !notif.isRead ? "bg-primary/[0.02]" : "bg-card"
                )}
              >
                {/* Icon Column */}
                <div className={cn(
                  "p-2 rounded-xl shrink-0 mt-1",
                  notif.type === 'SUCCESS' ? "bg-green-500/10 text-green-600" :
                  notif.type === 'ERROR' ? "bg-red-500/10 text-red-600" :
                  notif.type === 'WARNING' ? "bg-orange-500/10 text-orange-600" :
                  "bg-blue-500/10 text-blue-600"
                )}>
                  {notif.type === 'SUCCESS' ? <CheckCircle2 className="h-5 w-5" /> :
                   notif.type === 'ERROR' ? <XCircle className="h-5 w-5" /> :
                   <Info className="h-5 w-5" />}
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-2">
                    <h4 className={cn(
                      "text-sm font-semibold", 
                      !notif.isRead ? "text-foreground" : "text-foreground/80"
                    )}>
                      {notif.title}
                    </h4>
                    <span className="text-xs font-medium text-muted-foreground/70 shrink-0">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className={cn(
                    "text-sm mb-3",
                    !notif.isRead ? "text-muted-foreground" : "text-muted-foreground/70"
                  )}>
                    {notif.message}
                  </p>
                  
                  {/* Footer (Badges & Links) */}
                  <div className="flex flex-wrap items-center gap-3">
                    {!notif.isRead && (
                       <Badge variant="default" className="h-5 px-1.5 text-[10px] animate-pulse">NEW</Badge>
                    )}
                    <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase bg-muted/50">
                      {notif.type}
                    </Badge>
                    
                    {notif.actionUrl && (
                      <Link 
                        href={notif.actionUrl}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        View Details <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Actions Column */}
                <div className="shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted opacity-50 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!notif.isRead && (
                        <DropdownMenuItem onClick={() => handleMarkRead(notif.id)} className="gap-2 font-medium cursor-pointer">
                          <Check className="h-4 w-4 text-emerald-500" /> Mark as Read
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleDelete(notif.id)} className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 font-medium cursor-pointer">
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          {meta && meta.totalPages > 1 && (
            <div className="p-4 border-t border-border/40 bg-muted/10 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Showing page {meta.page} of {meta.totalPages}
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
