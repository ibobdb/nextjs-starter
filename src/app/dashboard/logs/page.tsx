"use client";

import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { 
  ShieldAlert, 
  Loader2, 
  Search,
  Filter,
  User,
  Activity,
  Globe,
  Database
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuditLogs } from "@/hooks/use-audit-logs";
import { cn } from "@/lib/utils";

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");

  const { logs, meta, isLoading } = useAuditLogs(page, 20, {
    action: actionFilter !== "all" ? actionFilter : undefined,
    entity: entityFilter !== "all" ? entityFilter : undefined,
  });

  const getActionColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("CREATE") || act.includes("SUCCESS")) return "bg-green-500/10 text-green-600 border-green-200/20";
    if (act.includes("DELETE") || act.includes("FAIL") || act.includes("ERROR")) return "bg-red-500/10 text-red-600 border-red-200/20";
    if (act.includes("UPDATE") || act.includes("EDIT")) return "bg-blue-500/10 text-blue-600 border-blue-200/20";
    return "bg-slate-500/10 text-slate-600 border-slate-200/20";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="System Audit Logs"
          description="View security events and administrative actions across DBStudio."
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <Select 
            value={actionFilter} 
            onValueChange={(v) => { setActionFilter(v); setPage(1); }}
          >
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="All Actions" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="UPDATE_ROLE">Update Role</SelectItem>
              <SelectItem value="UPDATE_PERMISSION">Update Permission</SelectItem>
              <SelectItem value="BROADCAST_MESSAGE">Broadcast Message</SelectItem>
              <SelectItem value="LOGIN_SUCCESS">Login Success</SelectItem>
              <SelectItem value="DELETE_NOTIFICATION">Delete Target</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={entityFilter} 
            onValueChange={(v) => { setEntityFilter(v); setPage(1); }}
          >
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="All Entities" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="User">User</SelectItem>
              <SelectItem value="Role">Role</SelectItem>
              <SelectItem value="Permission">Permission</SelectItem>
              <SelectItem value="Notification">Notification</SelectItem>
              <SelectItem value="Module">Module</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && logs.length === 0 ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert className="h-10 w-10 text-muted-foreground/30" />}
          title="No audit logs found"
          description="No security events match your current filters."
        />
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">Entity</th>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">IP Address</th>
                  <th className="px-6 py-4 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {format(new Date(log.createdAt), 'MMM dd, HH:mm')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={cn("uppercase text-[10px]", getActionColor(log.action))}>
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Database className="h-4 w-4" />
                        <span className="font-medium">{log.entity}</span>
                        {log.entityId && (
                          <span className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                            {log.entityId.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.user ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="font-medium">{log.user.name}</span>
                            <span className="text-xs text-muted-foreground">{log.user.email}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">System</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 opacity-50" />
                        {log.ipAddress || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-muted-foreground font-mono text-xs">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {meta && meta.totalPages > 1 && (
            <div className="p-4 border-t border-border/40 bg-muted/10 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Showing page {meta.page} of {meta.totalPages} ({meta.total} total)
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
