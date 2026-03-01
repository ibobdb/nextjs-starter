"use client"

import useSWR from "swr"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataLoader } from "@/components/common/data-loader"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { topicsApi } from "@/services/ts-worker/api/topics"
import { ClusteringProcess, ClusteringRequest } from "@/services/ts-worker/types"
import { Cpu, ChevronDown, Loader2, PlayCircle, CheckCircle2, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import React from "react"
import { Input } from "@/components/ui/input"

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  running:    { icon: Loader2, color: "text-blue-500", label: "Running" },
  processing: { icon: Loader2, color: "text-blue-500", label: "Processing" },
  completed:  { icon: CheckCircle2, color: "text-green-500", label: "Completed" },
  failed:     { icon: XCircle, color: "text-destructive", label: "Failed" },
};

// API returns: { success: boolean, data: ClusteringProcess[], meta: PaginationMeta }
interface ClusteringProcessesApiResponse {
  success: boolean;
  data: ClusteringProcess[];
  meta?: { total: number; page: number; limit: number; totalPages?: number };
}

const fetchProcesses = (page: number) =>
  topicsApi.getClusteringProcesses({ page, limit: 10, sortBy: "startTime", sortOrder: "desc" }).then((res) => {
    // The API returns { success, data: [], meta: {} } at the root
    const r = res as unknown as ClusteringProcessesApiResponse;
    if (r.success && Array.isArray(r.data)) {
      return {
        data: r.data,
        meta: r.meta
      };
    }
    throw new Error("Failed to fetch clustering processes");
  });

function formatDuration(start: string, end?: string): string {
  const ms = new Date(end ?? Date.now()).getTime() - new Date(start).getTime();
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`;
}

export default function ClusteringMonitor() {
  const [isOpen, setIsOpen] = useState(true);
  const [running, setRunning] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [lookback, setLookback] = useState("30");
  const [page, setPage] = useState(1);
  const [hasRunning, setHasRunning] = useState(false);

  const { data: response, isLoading, isValidating, mutate } = useSWR(
    ["ts-worker/topics/clustering-processes", page],
    () => fetchProcesses(page),
    {
      revalidateOnFocus: false,
      refreshInterval: hasRunning ? 5_000 : 30_000,
      keepPreviousData: true,
      onSuccess: (res) => 
        setHasRunning(res.data.some((p: ClusteringProcess) => 
          ["running", "processing"].includes(p.status.toLowerCase())
        )),
    }
  );

  const processes = response?.data;
  const meta = response?.meta;

  const handleRun = async () => {
    setRunning(true);
    const payload: ClusteringRequest = {};
    if (keyword.trim()) payload.keyword = keyword.trim();
    const days = parseInt(lookback, 10);
    if (!isNaN(days) && days > 0) payload.lookbackDays = days;

    try {
      const res = await topicsApi.runClustering(payload);
      if (res.success) {
        toast.success(`Clustering job started! Job ID: ${res.data?.jobId ?? "unknown"}`);
        setKeyword("");
        mutate();
        setIsOpen(true);
      } else {
        toast.error(`Failed to start clustering: ${res.message}`);
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setRunning(false);
    }
  };

  const activeCount = processes?.filter((p: ClusteringProcess) => 
    ["running", "processing"].includes(p.status.toLowerCase())
  ).length ?? 0;

  return (
    <Card className="border-none shadow-none bg-transparent">
          <div className="flex flex-col gap-6">
            {/* Run Clustering Form */}
            <div className="w-full">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase text-muted-foreground tracking-wide flex items-center justify-between">New Clustering Task

                      {activeCount > 0 && (
                    <Badge variant="outline" className="text-xs h-5 py-0 text-muted-foreground animate-pulse text-blue-500">
                      {activeCount} running
                    </Badge>
                  )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5 font-medium">Topic Keyword (optional)</label>
                    <Input
                      placeholder="e.g. AI Agents"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5 font-medium">Historical Lookback (days)</label>
                    <Input
                      type="number"
                      value={lookback}
                      onChange={(e) => setLookback(e.target.value)}
                      className="text-sm"
                      min={1}
                      max={365}
                    />
                  </div>
                  <Button className="w-full gap-2 cursor-pointer shadow-sm shadow-primary/20" onClick={handleRun} disabled={running}>
                    {running
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <PlayCircle className="h-4 w-4" />}
                    {running ? "Starting..." : "Initiate Clustering"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Job History */}
            <div className="w-full">
              <Card>
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">Process History</CardTitle>
                    <Badge variant="outline" className="font-normal text-[10px] text-muted-foreground">Recent 10 Jobs</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {isLoading ? (
                    <DataLoader isLoading={true} skeletonVariant="list" skeletonProps={{ rows: 6 }} />
                  ) : !processes?.length ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-muted/5">
                      <Clock className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground italic">No historical jobs found.</p>
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
                        "space-y-3 transition-opacity duration-300",
                        isValidating ? "opacity-40" : "opacity-100"
                      )}>
                        {processes.map((proc: ClusteringProcess) => {
                          const statusKey = proc.status.toLowerCase();
                          const isActive = ["running", "processing"].includes(statusKey);
                          const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.failed;
                          const Icon = cfg.icon;
                          return (
                            <div key={proc.id} className="flex flex-col gap-3 rounded-xl border bg-card/50 p-4 hover:border-primary/30 transition-all duration-200">
                              <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-muted/40 ${cfg.color} shrink-0`}>
                                  <Icon className={`h-5 w-5 ${isActive ? "animate-spin" : ""}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <p className="text-sm font-semibold truncate leading-none">
                                      {proc.filter?.keyword ?? proc.keyword ?? proc.category ?? "Global Clustering"}
                                    </p>
                                    <Badge variant="outline" className={`text-[10px] h-4 py-0 px-1.5 ${cfg.color} border-current/20 bg-current/5`}>
                                      {cfg.label}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                    <span className="flex items-center gap-1 font-mono">ID: {proc.id.slice(-6)}</span>
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDuration(proc.startTime, proc.endTime ?? undefined)}</span>
                                    <span>{new Date(proc.startTime).toLocaleDateString()} {new Date(proc.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Detailed Metrics */}
                              {proc.status.toLowerCase() === 'completed' && proc.resultSummary && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {proc.resultSummary.trendingKeywordsFound !== undefined && (
                                    <div className="bg-muted px-2 py-1 rounded text-[10px] flex items-center gap-1">
                                      <span className="text-primary font-bold">{proc.resultSummary.trendingKeywordsFound}</span> Keywords
                                    </div>
                                  )}
                                  {proc.resultSummary.processedClusters !== undefined && (
                                    <div className="bg-muted px-2 py-1 rounded text-[10px] flex items-center gap-1">
                                      <span className="text-primary font-bold">{proc.resultSummary.processedClusters}</span> Clusters
                                    </div>
                                  )}
                                  {proc.resultSummary.evaluatedCandidates !== undefined && (
                                    <div className="bg-muted px-2 py-1 rounded text-[10px] flex items-center gap-1">
                                      <span className="text-primary font-bold">{proc.resultSummary.evaluatedCandidates}</span> Candidates
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
                {/* Pagination Controls */}
                {meta && meta.totalPages && meta.totalPages > 1 && (
                  <div className="px-6 py-4 border-t flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Page {meta.page} of {meta.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2" 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={meta.page <= 1}
                      >
                        Previous
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2" 
                        onClick={() => setPage(p => Math.min(meta.totalPages!, p + 1))}
                        disabled={meta.page >= meta.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
    </Card>
  );
}
