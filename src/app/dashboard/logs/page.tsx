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
import { AppTable } from "@/components/common/app-table";
import { ColumnDef } from "@tanstack/react-table";
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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground whitespace-nowrap">
            {format(new Date(row.original.createdAt), 'MMM dd, HH:mm')}
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
          </span>
        </div>
      )
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <Badge variant="outline" className={cn("uppercase text-[10px] whitespace-nowrap", getActionColor(row.original.action))}>
          {row.original.action.replace(/_/g, ' ')}
        </Badge>
      )
    },
    {
      accessorKey: "entity",
      header: "Entity",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
          <Database className="h-4 w-4" />
          <span className="font-medium">{row.original.entity}</span>
          {row.original.entityId && (
            <span className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded">
              {row.original.entityId.substring(0, 8)}...
            </span>
          )}
        </div>
      )
    },
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => (
        row.original.user ? (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex flex-col">
              <span className="font-medium">{row.original.user.name}</span>
              <span className="text-xs text-muted-foreground">{row.original.user.email}</span>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground italic whitespace-nowrap">System</span>
        )
      )
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
          <Globe className="h-4 w-4 opacity-50" />
          {row.original.ipAddress || 'Unknown'}
        </div>
      )
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => (
        <div className="max-w-[200px] sm:max-w-[300px] truncate text-muted-foreground font-mono text-xs">
          {row.original.details ? JSON.stringify(row.original.details) : '-'}
        </div>
      )
    }
  ];

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

      <AppTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        emptyTitle="No audit logs found"
        emptyDescription="No security events match your current filters."
        emptyIcon={<ShieldAlert className="h-10 w-10 text-muted-foreground/30" />}
        pagination={meta && meta.totalPages > 1 ? {
          page: meta.page,
          pageSize: 20,
          total: meta.total,
          setPage: setPage
        } : undefined}
      />
    </div>
  );
}
