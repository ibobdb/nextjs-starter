'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { DataLoader } from '@/components/ui/data-loader';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useData } from '@/hooks/use-data';
import { accessApi, type Role, type Permission } from '@/services/access/api';

const MODULE_COLORS: Record<string, string> = {
  dashboard:   'bg-sky-500/10 text-sky-600 border-sky-500/20',
  user:        'bg-violet-500/10 text-violet-600 border-violet-500/20',
  trendscout:  'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  roles:       'bg-amber-500/10 text-amber-600 border-amber-500/20',
  permissions: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  log:         'bg-slate-500/10 text-slate-500 border-slate-500/20',
  settings:    'bg-pink-500/10 text-pink-600 border-pink-500/20',
};

export function RolePermissionsTab() {
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  const [toggling, setToggling] = useState<number | null>(null);

  // ── Load roles & permissions ─────────────────────────────────────────────
  const { data: roles = [], isLoading: rolesLoading } = useData<Role[]>(
    'access-roles',
    () => accessApi.getRoles(),
    { transform: (res) => res.data! }
  );

  const { data: permData, isLoading: permsLoading, error: permsError } = useData<{
    permissions: Permission[];
    grouped: Record<string, Permission[]>;
  }>(
    'access-permissions',
    () => accessApi.getPermissions(),
    { transform: (res) => res.data! }
  );

  // ── Load assigned permissions ketika role dipilih ──────────────────────
  const {
    data: assignedPerms = [],
    isLoading: assignedLoading,
    refetch: refetchAssigned,
    error: assignedError,
  } = useData<Permission[]>(
    selectedRoleId ? `role-perms-${selectedRoleId}` : null,
    () => accessApi.getRolePermissions(selectedRoleId!),
    { transform: (res) => res.data! }
  );


  // Stable key: string dari sorted IDs — tidak berubah saat SWR return array baru dengan konten sama
  const assignedPermsKey = assignedPerms.map((p) => p.id).sort().join(',');

  useEffect(() => {
    setAssignedIds(new Set(assignedPerms.map((p) => p.id)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedPermsKey]);

  // ── Toggle permission ────────────────────────────────────────────────────
  const handleToggle = async (permission: Permission, checked: boolean) => {
    if (!selectedRoleId || toggling !== null) return;
    setToggling(permission.id);

    // Optimistic update
    setAssignedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(permission.id); else next.delete(permission.id);
      return next;
    });

    try {
      if (checked) {
        await accessApi.assignPermission(selectedRoleId, permission.id);
        toast.success(`${permission.name} ditambahkan`);
      } else {
        await accessApi.removePermission(selectedRoleId, permission.id);
        toast.success(`${permission.name} dihapus`);
      }
      refetchAssigned();
    } catch (e: unknown) {
      // Rollback
      setAssignedIds((prev) => {
        const next = new Set(prev);
        if (checked) next.delete(permission.id); else next.add(permission.id);
        return next;
      });
      toast.error(e instanceof Error ? e.message : 'Gagal mengubah permission');
    } finally {
      setToggling(null);
    }
  };

  const grouped = permData?.grouped ?? {};
  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const isLoading = assignedLoading || permsLoading;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Role Permissions"
        description="Pilih role, lalu atur permission yang dimilikinya."
      />

      {/* Role Selector */}
      <div className="max-w-xs">
        {rolesLoading ? (
          <DataLoader variant="list" rows={1} />
        ) : (
          <Select
            value={selectedRoleId?.toString() ?? ''}
            onValueChange={(v) => setSelectedRoleId(Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih role..." />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id.toString()}>
                  <span className="font-mono text-sm">{r.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Permission Checklist */}
      {!selectedRoleId && (
        <EmptyState
          icon={<ShieldCheck className="h-7 w-7 text-muted-foreground/60" />}
          title="Pilih role terlebih dahulu"
          description="Permissions akan tampil setelah memilih role di atas."
        />
      )}

      {selectedRoleId && (assignedError || permsError) && (
        <ErrorState onRetry={refetchAssigned} />
      )}

      {selectedRoleId && isLoading && (
        <DataLoader variant="list" rows={8} />
      )}

      {selectedRoleId && !isLoading && (
        <div className="space-y-5">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{assignedIds.size}</span> dari{' '}
            <span className="font-semibold text-foreground">
              {permData?.permissions.length ?? 0}
            </span>{' '}
            permissions aktif untuk role{' '}
            <code className="bg-muted px-1 py-0.5 rounded">{selectedRole?.name}</code>
          </p>

          {Object.entries(grouped).map(([module, perms]) => (
            <div key={module} className="rounded-xl border border-border/50 overflow-hidden">
              {/* Module Header */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border/50">
                <Badge
                  variant="outline"
                  className={`capitalize text-[11px] ${MODULE_COLORS[module] ?? 'bg-muted text-muted-foreground'}`}
                >
                  {module}
                </Badge>
                <span className="text-xs text-muted-foreground ml-auto">
                  {perms.filter((p) => assignedIds.has(p.id)).length}/{perms.length}
                </span>
              </div>

              {/* Permission rows */}
              <div className="divide-y divide-border/40">
                {perms.map((perm) => {
                  const isChecked = assignedIds.has(perm.id);
                  const isToggling = toggling === perm.id;

                  return (
                    <label
                      key={perm.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 cursor-pointer transition-colors"
                    >
                      {isToggling ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                      ) : (
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleToggle(perm, checked === true)
                          }
                          className="shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <code className="text-xs font-mono text-foreground">{perm.name}</code>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                          {perm.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
