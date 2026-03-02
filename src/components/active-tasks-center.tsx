'use client';

import { ListTodo, Loader2 } from 'lucide-react';
import { useNotificationSystem } from '@/lib/notification-package';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ActiveTasksCenter() {
  const { tasks } = useNotificationSystem();
  
  // Debug log to see tasks in UI
  console.log(`[ACTIVE_TASKS_UI] Total tasks from context: ${tasks.length}`);

  const activeTasks = tasks.filter(
    (t) => t.status === 'RUNNING' || t.status === 'PENDING'
  );
  
  if (activeTasks.length > 0) {
    console.log(`[ACTIVE_TASKS_UI] Displaying ${activeTasks.length} active tasks`);
  }

  if (activeTasks.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative cursor-pointer hover:bg-muted/80 transition-colors group"
        >
          <ListTodo className="h-5 w-5 text-primary animate-pulse" />
          <Badge 
            className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-primary text-primary-foreground border-2 border-background animate-in zoom-in-50 duration-300"
          >
            {activeTasks.length}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 shadow-xl border-border/50 bg-background/95 backdrop-blur-md">
        <DropdownMenuLabel className="p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Active Tasks</span>
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" />
        
        <ScrollArea className="max-h-[300px]">
          <div className="p-2 space-y-1">
            {activeTasks.map((task) => (
              <div 
                key={task.id} 
                className="px-3 py-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/30 transition-all"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold leading-none truncate flex-1">
                      {task.title}
                    </p>
                    <Badge variant="outline" className="text-[9px] h-3.5 py-0 px-1 border-primary/20 bg-primary/10 text-primary">
                      {task.status}
                    </Badge>
                  </div>
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-pulse w-2/3 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
