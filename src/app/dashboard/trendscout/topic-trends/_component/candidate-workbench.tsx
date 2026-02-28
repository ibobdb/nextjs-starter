"use client"

import useSWR from "swr"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataLoader } from "@/components/ui/data-loader"
import { topicsApi } from "@/services/ts-worker/api/topics"
import { statsApi } from "@/services/ts-worker/api/stats"
import { TopicCandidate } from "@/services/ts-worker/types"
import { ApiResponse } from "@/types/response"
import {
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  Loader2,
  ExternalLink,
  Sparkles,
  Search as SearchIcon,
  Filter,
  EyeOff,
} from "lucide-react"
import { toast } from "sonner"

type StatusFilter = "generated" | "approved" | "drafting" | "rejected" | "ignored";

const STATUS_BADGE: Record<StatusFilter, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  generated: { label: "Pending",  variant: "secondary" },
  approved:  { label: "Approved", variant: "default" },
  drafting:  { label: "Drafting", variant: "secondary" },
  rejected:  { label: "Rejected", variant: "destructive" },
  ignored:   { label: "Ignored",  variant: "outline" },
};

// Actual API shape: { success, data: TopicCandidate[], meta: { total, page, limit } }
interface CandidatesApiResponse extends Omit<ApiResponse<TopicCandidate[]>, "data"> {
  data: TopicCandidate[];
  meta?: { total: number; page: number; limit: number; totalPages?: number };
}

const fetchCandidates = (params: { status: StatusFilter; page: number; search?: string; intent?: string }) =>
  topicsApi.getCandidates({ ...params, limit: 10, sortBy: "createdAt", sortOrder: "desc" }).then((res) => {
    const r = res as unknown as CandidatesApiResponse;
    if (r.success) {
      const candidates = Array.isArray(r.data) ? r.data : [];
      const meta = r.meta;
      return {
        candidates,
        totalPages: (meta?.totalPages ?? Math.ceil((meta?.total ?? 0) / 10)) || 1,
        total: meta?.total ?? candidates.length,
      };
    }
    throw new Error("Failed to fetch candidates");
  });

const fetchIntents = () => statsApi.getCategoriesList().then(res => res.data?.map(i => i.intent) ?? []);

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "text-green-500" : score >= 40 ? "text-yellow-500" : "text-red-400";
  return <span className={`text-sm font-bold tabular-nums ${color}`}>{score}</span>;
}

export default function CandidateWorkbench() {
  const router = useRouter();
  const [status, setStatus] = useState<StatusFilter>("approved");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [intent, setIntent] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const swrKey = ["ts-worker/topics/candidates", status, page, search, intent];
  const { data, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    () => fetchCandidates({ status, page, search, intent: intent === "all" ? undefined : intent }),
    { revalidateOnFocus: true, keepPreviousData: true, refreshInterval: status === 'approved' ? 30_000 : 0 }
  );

  const { data: intents = [] } = useSWR("ts-worker/stats/categories/list", fetchIntents);

  const candidates = data?.candidates ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const handleStatusChange = (s: StatusFilter) => {
    setStatus(s);
    setPage(1);
    setSelectedIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map(c => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAction = async (id: string, action: "approve" | "reject" | "ignore") => {
    setActionLoading(id + action);
    try {
      const res = action === "approve"
        ? await topicsApi.approveCandidate(id)
        : action === "reject"
        ? await topicsApi.rejectCandidate(id)
        : await topicsApi.ignoreCandidate(id);

      if (res.success) {
        toast.success(`${action} success!`);
        mutate();
      } else {
        toast.error(`Action failed: ${res.message}`);
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action: "approve" | "reject") => {
    if (selectedIds.length === 0) return;
    setActionLoading("bulk" + action);
    try {
      const res = action === "approve"
        ? await topicsApi.bulkApprove(selectedIds)
        : await topicsApi.bulkReject(selectedIds);

      if (res.success) {
        toast.success(`Bulk ${action} success for ${selectedIds.length} items!`);
        setSelectedIds([]);
        mutate();
      } else {
        toast.error(`Bulk failed: ${res.message}`);
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Card className="flex-1">
      <CardHeader className="pb-3 border-b">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <BrainCircuit className="h-4 w-4 text-primary" />
                Topic Candidates
              </CardTitle>
              <CardDescription>
                {isLoading ? "Loading…" : `${total} candidates`}
                {status === "approved" && !isLoading && (
                  <span className="ml-1 text-primary">· needs brief</span>
                )}
              </CardDescription>
            </div>
            {/* Status Tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg self-start">
              {(["generated", "approved", "drafting", "rejected", "ignored"] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize cursor-pointer ${
                    status === s
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search title or keyword..."
                className="pl-9 h-9 text-sm"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={intent} onValueChange={(v) => { setIntent(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-[150px] text-xs">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="All Intents" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Intents</SelectItem>
                  {intents.map(i => (
                    <SelectItem key={i} value={i} className="capitalize">{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Bulk Actions Mini-Toolbar */}
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-1.5 pl-3 border-l ml-1 animate-in fade-in slide-in-from-left-2 transition-all">
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                    {selectedIds.length} Selected
                  </span>
                  <Button
                    size="sm" variant="ghost"
                    className="h-8 px-2 text-[10px] gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                    disabled={!!actionLoading}
                    onClick={() => handleBulkAction("approve")}
                  >
                    {actionLoading === "bulkapprove" ? <Loader2 className="h-3 w-3 animate-spin"/> : <CheckCircle2 className="h-3 w-3" />}
                    Approve
                  </Button>
                  <Button
                    size="sm" variant="ghost"
                    className="h-8 px-2 text-[10px] gap-1 text-destructive hover:bg-destructive/5"
                    disabled={!!actionLoading}
                    onClick={() => handleBulkAction("reject")}
                  >
                    {actionLoading === "bulkreject" ? <Loader2 className="h-3 w-3 animate-spin"/> : <XCircle className="h-3 w-3" />}
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading && candidates.length === 0 ? (
          <DataLoader variant="table" rows={6} />
        ) : candidates.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground italic py-10">
            No {status} candidates found.
          </p>
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
              "space-y-2 transition-opacity duration-300",
              isValidating ? "opacity-40" : "opacity-100"
            )}>
            {/* Header Row for Selection */}
            <div className="flex items-center gap-3 px-4 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-transparent">
              <Checkbox
                checked={selectedIds.length === candidates.length && candidates.length > 0}
                onCheckedChange={toggleSelectAll}
                className="h-3.5 w-3.5"
              />
              <span className="flex-1">Selection</span>
            </div>

            {candidates.map((c) => {
              const hasBrief = !!c.aiBrief;
              const isSelected = selectedIds.includes(c.id);
              return (
                <div
                  key={c.id}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all ${
                    isSelected
                      ? "border-primary/50 bg-primary/5 shadow-sm"
                      : "border-border hover:border-border/80 hover:bg-muted/10"
                  } ${isLoading ? "opacity-60" : ""}`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelectOne(c.id)}
                    className="h-4 w-4"
                  />
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate leading-snug">{c.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{c.mainKeyword}</p>
                  </div>

                  {/* Score + Status */}
                  <div className="flex items-center gap-2 shrink-0">
                    <ScoreBadge score={c.aiScore ?? c.score} />
                    <Badge
                      variant={STATUS_BADGE[c.status as StatusFilter]?.variant ?? "outline"}
                      className="text-xs capitalize h-5 py-0 hidden sm:flex"
                    >
                      {STATUS_BADGE[c.status as StatusFilter]?.label ?? c.status}
                    </Badge>
                    {/* Show brief indicator */}
                    {c.status === "approved" && hasBrief && (
                      <Badge variant="outline" className="text-[10px] h-5 py-0 text-green-600 border-green-600/30 bg-green-500/5 hidden md:flex">
                        has brief
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* generated: approve or reject inline */}
                    {c.status === "generated" && (
                      <>
                        <Button
                          size="icon" variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-green-500 hover:bg-green-50/50 cursor-pointer"
                          title="Approve"
                          disabled={!!actionLoading}
                          onClick={() => handleAction(c.id, "approve")}
                        >
                          {actionLoading === c.id + "approve"
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <CheckCircle2 className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          size="icon" variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Reject"
                          disabled={!!actionLoading}
                          onClick={() => handleAction(c.id, "reject")}
                        >
                          {actionLoading === c.id + "reject"
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <XCircle className="h-3.5 w-3.5" />}
                        </Button>
                      </>
                    )}
                    
                    {/* approved without brief: shortcut Create Brief button */}
                    {c.status === "approved" && !hasBrief && (
                      <Button
                        size="sm" variant="ghost"
                        className="h-7 px-2 text-[11px] gap-1 text-primary hover:bg-primary/10"
                        title="Create Brief"
                        disabled={!!actionLoading}
                        onClick={() => handleAction(c.id, "approve")}
                      >
                        {actionLoading === c.id + "approve"
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <Sparkles className="h-3 w-3" />}
                        Brief
                      </Button>
                    )}

                    {/* Ignore Button — for non-ignored candidates */}
                    {c.status !== "ignored" && c.status !== "rejected" && (
                      <Button
                        size="icon" variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 cursor-pointer"
                        title="Ignore"
                        disabled={!!actionLoading}
                        onClick={() => handleAction(c.id, "ignore")}
                      >
                        {actionLoading === c.id + "ignore"
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <EyeOff className="h-3.5 w-3.5" />}
                      </Button>
                    )}

                    {/* Detail — always visible */}
                    <Button
                      size="icon" variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                      title="View Detail"
                      onClick={() => router.push(`/dashboard/trendscout/topic-trends/${c.id}`)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="outline" className="h-7 w-7"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}>
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="outline" className="h-7 w-7"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || isLoading}>
                    <ChevronRight className="h-3.5 w-3.5" />
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
