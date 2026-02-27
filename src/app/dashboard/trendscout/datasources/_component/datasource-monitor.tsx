"use client"

import useSWR from "swr"
import { cn } from "@/lib/utils"
import { dataSourcesApi } from "@/services/ts-worker/api/datasources"
import { DataSource } from "@/services/ts-worker/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataLoader } from "@/components/ui/data-loader"
import { Github,Globe,Code,MessageSquare,Box,Database } from "lucide-react"
import { statsApi } from "@/services/ts-worker/api/stats"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Activity,
  Zap,
  ShieldCheck,
  FileSearch,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"

const SOURCE_ICONS: Record<string, React.ElementType> = {
  github: Github,
  stackoverflow: MessageSquare,
  hackernews: Globe,
  devto: Code,
  reddit: MessageSquare,
  npm: Box,
  pypi: Box,
  gitlab: Github,
  bitbucket: Github,
  default: Database
};

const fetchDatasources = () => 
  dataSourcesApi.listDataSources().then(res => res.data ?? []);

const fetchPerformance = () => statsApi.getSourcesPerformance().then(res => res.data ?? []);

const fetchLogs = (runId: string) => dataSourcesApi.getRunLogs(runId).then(res => res.data ?? []);

function RunLogsDialog({ runId, sourceName }: { runId: string; sourceName: string }) {
  const { data: logs, isLoading } = useSWR(
    runId ? `ts-worker/datasources/runs/${runId}/logs` : null,
    () => fetchLogs(runId)
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-[10px] text-primary hover:underline font-medium">View Logs</button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSearch className="h-4 w-4" /> Run Logs: {sourceName}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 mt-4 rounded-md border bg-muted/30 p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-xs">Fetching logs...</p>
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-1.5">
              {logs.map((log, i) => (
                <div key={i} className="text-[11px] font-mono flex gap-3 leading-relaxed border-b border-muted py-1 last:border-0 hover:bg-muted/50 rounded px-1">
                  <span className="text-muted-foreground shrink-0 w-[60px]">
                    {new Date(log.timestamp || log.createdAt || 0).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className={cn(
                    "font-bold shrink-0 uppercase w-[40px] text-right",
                    log.level === 'ERROR' ? 'text-destructive' : log.level === 'WARN' ? 'text-amber-500' : 'text-blue-500'
                  )}>
                    [{log.level}]
                  </span>
                  <span className="text-foreground/90">{log.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground py-10 italic">No logs found for this run.</p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default function DatasourceMonitor() {
  const { data: sources, isLoading } = useSWR(
    "ts-worker/datasources",
    fetchDatasources,
    { refreshInterval: 60000 }
  );

  const { data: performance = [] } = useSWR(
    "ts-worker/stats/performance",
    fetchPerformance
  );

  const getPerf = (type: string) => performance.find(p => p.source === type);

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="px-0">
        {isLoading ? (
          <DataLoader variant="stat-cards" count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources?.map((source: DataSource) => {
              const Icon = SOURCE_ICONS[source.type] || SOURCE_ICONS.default;
              const isSuccess = source.lastRun?.status === 'SUCCESS';
              const isRunning = source.lastRun?.status === 'RUNNING';
              const isFailed = source.lastRun?.status === 'FAILED';
              
              const perf = getPerf(source.type);
              
              return (
                <Card key={source.id} className="h-full flex flex-col overflow-hidden border bg-card/50 hover:border-primary/30 transition-all duration-200">
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-foreground/70" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm leading-none mb-1">{source.name}</h3>
                          <div className="flex items-center gap-1.5">
                            <Badge variant={source.enabled ? "outline" : "secondary"} className={cn("text-[10px] h-4 px-1 leading-none", source.enabled && "text-green-500 border-green-500/20 bg-green-500/5")}>
                              {source.enabled ? "Active" : "Disabled"}
                            </Badge>
                            {source.reliabilityScore !== undefined && (
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium bg-muted/30 px-1.5 rounded h-4">
                                <ShieldCheck className="h-2.5 w-2.5 text-blue-500" />
                                {Math.round(source.reliabilityScore * 100)}%
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {source.lastRun && (
                        <div className={cn(
                          "p-1.5 rounded-full",
                          isSuccess ? "bg-green-500/10" : isRunning ? "bg-primary/10" : "bg-destructive/10"
                        )}>
                          {isSuccess ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : isRunning ? (
                            <Loader2 className="h-4 w-4 text-primary animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2.5 mt-4">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Last Run
                        </span>
                        <div className="text-right">
                          {source.lastRun ? (
                            <div className="flex flex-col items-end">
                              <span className="font-medium">
                                {new Date(source.lastRun.startTime).toLocaleDateString()} {new Date(source.lastRun.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {source.lastRun.id && (
                                <RunLogsDialog runId={source.lastRun.id} sourceName={source.name} />
                              )}
                            </div>
                          ) : <span className="text-muted-foreground italic">Never</span>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Activity className="h-3 w-3" /> Cycle Created
                        </span>
                        <span className="font-bold text-primary tabular-nums">
                          {source.lastRun?.itemsCreated ?? 0}
                        </span>
                      </div>

                      {perf && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Zap className="h-3 w-3 text-amber-500" /> Avg. Success
                          </span>
                          <span className="font-bold tabular-nums">
                            {perf.avgSuccessRate ? Math.round(perf.avgSuccessRate * 100) : 0}% 
                            <span className="text-muted-foreground font-normal ml-1">({perf.totalRuns})</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {source.lastRun && isRunning && (
                     <div className="px-4 py-2 bg-primary/5 border-t border-primary/10 flex items-center justify-between">
                       <p className="text-[10px] text-primary font-bold flex items-center gap-1 uppercase tracking-tighter">
                         <Loader2 className="h-3 w-3 animate-spin" /> Syncing in progress...
                       </p>
                     </div>
                  )}
                  
                  {source.lastRun && isFailed && (
                     <div className="px-4 py-2 bg-destructive/5 border-t border-destructive/10 flex items-center justify-between">
                       <p className="text-[10px] text-destructive font-bold flex items-center gap-1 uppercase tracking-tighter">
                         <XCircle className="h-3 w-3" /> Execution failed
                       </p>
                       {source.lastRun.id && (
                          <RunLogsDialog runId={source.lastRun.id} sourceName={source.name} />
                       )}
                     </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
