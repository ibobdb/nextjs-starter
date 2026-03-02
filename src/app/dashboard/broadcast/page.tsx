'use client';

import { Megaphone } from 'lucide-react';
import { BroadcastTool } from './_components/broadcast-tool';

export default function BroadcastPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b pb-8">
        <div className="flex flex-col gap-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Megaphone className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">System Broadcast</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto lg:mx-0 ml-13">
            Send real-time notifications to all users or specific roles across the platform.
          </p>
        </div>
      </div>

      <div className="max-w-4xl space-y-8">
        <BroadcastTool />
      </div>
    </div>
  );
}
