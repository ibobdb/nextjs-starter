"use client"

import useSWR from "swr"
import { jobsApi } from "@/services/ts-worker/api/jobs"
import { JobLog } from "@/services/ts-worker/types"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataLoader } from "@/components/ui/data-loader"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react"
import React, { useState } from "react"

const LOG_STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  SUCCESS: { icon: CheckCircle2, color: "text-green-500", label: "Success" },
  FAILED:  { icon: XCircle, color: "text-destructive", label: "Failed" },
  RUNNING: { icon: Clock, color: "text-blue-500", label: "Running" },
  PENDING: { icon: Clock, color: "text-muted-foreground", label: "Pending" },
};

const fetchJobLogs = (page: number) => 
  jobsApi.getLogs({ page, limit: ITEMS_PER_PAGE }).then(res => {
    if (res.success) {
      return res;
    }
    throw new Error("Failed to fetch job logs");
  });

const ITEMS_PER_PAGE = 8;

export default function JobLogHistory() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading, isValidating } = useSWR(
    ["ts-worker/jobs/logs", page],
    () => fetchJobLogs(page),
    { keepPreviousData: true }
  );

  const logs = response?.data;
  const meta = response?.meta;
  const totalLogs = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? Math.ceil(totalLogs / ITEMS_PER_PAGE);

  return (
    <Card className="border shadow-sm bg-card overflow-hidden">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-primary" />
              General System Logs
            </CardTitle>
            <CardDescription className="text-xs">Audit trail of all system-wide background tasks</CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">Historical Activity</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && !response ? (
          <div className="p-6">
            <DataLoader variant="list" rows={ITEMS_PER_PAGE} />
          </div>
        ) : !logs?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground italic">No system logs available yet.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Smooth Loading Overlay */}
            {isValidating && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40 backdrop-blur-[1px] transition-all duration-300">
                <div className="bg-background/80 p-2 rounded-full shadow-lg border animate-in zoom-in-50 duration-200">
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                </div>
              </div>
            )}
            
            <div className={cn(
              "divide-y overflow-hidden min-h-[500px] transition-opacity duration-300",
              isValidating ? "opacity-40" : "opacity-100"
            )}>
              {logs?.map((log: JobLog) => {
                const cfg = LOG_STATUS_CONFIG[log.status] || LOG_STATUS_CONFIG.FAILED;
                const LogIcon = cfg.icon;
                const startTime = new Date(log.startTime);
                
                return (
                  <div key={log.id} className="p-4 hover:bg-muted/10 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-muted/50 ${cfg.color}`}>
                        <LogIcon className={`h-4 w-4 ${log.status === 'RUNNING' ? 'animate-spin' : ''}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate leading-tight">{log.jobName}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[80px]">ID: {log.id}</span>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                            <Clock className="h-3 w-3" />
                            {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                            <Calendar className="h-3 w-3" />
                            {startTime.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <Badge variant="outline" className={`text-[10px] font-medium h-5 ${cfg.color} border-current/20 bg-current/5`}>
                        {cfg.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t bg-muted/5 flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground font-medium">
                  Showing <span className="text-foreground">{(page - 1) * ITEMS_PER_PAGE + 1}</span>-
                  <span className="text-foreground">{Math.min(page * ITEMS_PER_PAGE, totalLogs)}</span> of <span className="text-foreground">{totalLogs}</span> logs
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-[11px] font-bold px-2">
                    {page} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
