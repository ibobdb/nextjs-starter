'use client';

import { Server } from 'lucide-react';
import Link from 'next/link';
import { siteMetadata } from '@/config/meta';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SystemStatusProps {
  isCollapsed?: boolean;
  appName?: string;
}

export function SystemStatus({ isCollapsed, appName = 'DBS' }: SystemStatusProps) {
  const content = (
    <div
      className={cn(
        'flex items-center rounded-lg hover:bg-accent transition-colors cursor-pointer group w-full',
        isCollapsed ? 'justify-center p-2' : 'p-2 space-x-3'
      )}
    >
      <div className="relative shrink-0">
        <Server 
          size={isCollapsed ? 20 : 18} 
          className={cn(
            "text-muted-foreground group-hover:text-foreground transition-colors",
            isCollapsed && "mx-auto"
          )} 
        />
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-status-pulse absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </div>

      {!isCollapsed && (
        <div className="flex flex-col min-w-0 overflow-hidden text-left">
          <span className="text-[11px] font-medium text-foreground truncate leading-tight">
            {appName} v{siteMetadata.version}
          </span>
          <span className="text-[10px] text-muted-foreground truncate leading-tight">
            Environment: {siteMetadata.environment || 'Production'}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/dashboard/logs" className="w-full">
            {content}
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" className="flex flex-col gap-0.5 px-2 py-1.5">
            <span className="text-[11px] font-semibold">{appName} v{siteMetadata.version}</span>
            <span className="text-[10px] text-muted-foreground">Environment: {siteMetadata.environment || 'Production'}</span>
            <span className="text-[9px] text-green-500 font-medium mt-0.5">● Online</span>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
