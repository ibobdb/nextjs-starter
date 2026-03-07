'use client';

import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface PermissionAlertProps {
  className?: string;
  title?: string;
  message?: string;
}

export function PermissionAlert({ 
  className, 
  title = "Read-Only Mode", 
  message = "You do not have permission to modify data on this page. Please contact your administrator if you require further access."
}: PermissionAlertProps) {
  return (
    <div className={cn(
      "bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 text-amber-800 mb-6",
      className
    )}>
      <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
      <div className="text-sm">
        <p className="font-semibold">{title}</p>
        <p className="opacity-90">{message}</p>
      </div>
    </div>
  );
}
