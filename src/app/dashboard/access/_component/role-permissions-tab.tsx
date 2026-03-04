"use client";

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
import { Button } from '@/components/ui/button';
import { usePermission } from '@/lib/rbac/hooks/usePermission';
import { useSession } from '@/hooks/use-session';
import { PermissionAlert } from '@/components/common/permission-alert';
import { canManageRole } from '@/lib/role-hierarchy';
import { ShieldAlert } from 'lucide-react';

const MODULE_COLORS: Record<string, string> = {
  dashboard:   'bg-sky-500/10 text-sky-600 border-sky-500/20',
  user:        'bg-violet-500/10 text-violet-600 border-violet-500/20',
  roles:       'bg-amber-500/10 text-amber-600 border-amber-500/20',
  permissions: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  log:         'bg-slate-500/10 text-slate-500 border-slate-500/20',
  settings:    'bg-pink-500/10 text-pink-600 border-pink-500/20',
};

export function RolePermissionsTab() {
  const { user } = useSession();
  const { allowed: canUpdate } = usePermission('user.update');
  const actorRoles = user?.roles ?? [];
  const hasUpdateAccess = canUpdate;

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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

  // Sync assigned IDs when API data changes
  const assignedPermsKey = assignedPerms.map((p) => p.id).sort().join(',');
  useEffect(() => {
    setAssignedIds(new Set(assignedPerms.map((p) => p.id)));
    setHasChanges(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedPermsKey, selectedRoleId]);

  // Handle single permission toggle
  const handleToggle = (permissionId: number, checked: boolean) => {
    setAssignedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(permissionId);
      else next.delete(permissionId);
      return next;
    });
    setHasChanges(true);
  };

  // Handle Select All/None for a specific module
  const handleToggleModule = (moduleId: string, checkAll: boolean) => {
    if (!permData) return;
    const permsInModule = permData.grouped[moduleId] || [];
    
    setAssignedIds((prev) => {
      const next = new Set(prev);
      if (checkAll) {
        permsInModule.forEach(p => next.add(p.id));
      } else {
        permsInModule.forEach(p => next.delete(p.id));
      }
      return next;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setIsSaving(true);
    
    try {
      await accessApi.syncRolePermissions(selectedRoleId, Array.from(assignedIds));
      toast.success("Permissions updated successfully");
      setHasChanges(false);
      refetchAssigned();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to change permissions');
    } finally {
      setIsSaving(false);
    }
  };

  const grouped = permData?.grouped ?? {};
  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const actorCanManageSelectedRole = selectedRole ? canManageRole(actorRoles, selectedRole.name) : true;
  const isLoading = assignedLoading || permsLoading;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Role Permissions"
        description="Select a role, then manage its assigned permissions."
      />

      {!hasUpdateAccess && (
        <PermissionAlert 
          message="You do not have permission to change permission mappings to roles. Please contact an administrator for permission update access."
        />
      )}

      {hasUpdateAccess && selectedRole && !actorCanManageSelectedRole && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
          <p>You cannot modify permissions for the <code className="font-mono bg-amber-100 px-1 rounded">{selectedRole.name}</code> role because it is equal to or above your role in the hierarchy.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Role Selector */}
        <div className="max-w-xs w-full">
          {rolesLoading ? (
            <DataLoader variant="list" rows={1} />
          ) : (
            <Select
              value={selectedRoleId?.toString() ?? ''}
              onValueChange={(v) => setSelectedRoleId(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role..." />
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

        {/* Save Controls */}
        {selectedRoleId && (
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {hasChanges && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setAssignedIds(new Set(assignedPerms.map((p) => p.id)));
                  setHasChanges(false);
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
            )}
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || isSaving || !hasUpdateAccess || !actorCanManageSelectedRole}
              className="gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {/* Permission Checklist */}
      {!selectedRoleId && (
        <EmptyState
          icon={<ShieldCheck className="h-7 w-7 text-muted-foreground/60" />}
          title="Select a role first"
          description="Permissions will appear after selecting a role above."
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
            <span className="font-semibold text-foreground">{assignedIds.size}</span> of{' '}
            <span className="font-semibold text-foreground">
              {permData?.permissions.length ?? 0}
            </span>{' '}
            permissions active for role{' '}
            <code className="bg-muted px-1 py-0.5 rounded">{selectedRole?.name}</code>
          </p>

          {Object.entries(grouped).map(([module, perms]) => {
             const selectedInModule = perms.filter((p) => assignedIds.has(p.id)).length;
             const isAllSelected = selectedInModule === perms.length;

             return (
              <div key={module} className="rounded-xl border border-border/50 overflow-hidden">
                {/* Module Header */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border/50">
                  <Badge
                    variant="outline"
                    className={`capitalize text-[11px] ${MODULE_COLORS[module] ?? 'bg-muted text-muted-foreground'}`}
                  >
                    {module}
                  </Badge>
                  
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {selectedInModule}/{perms.length}
                    </span>
                    
                    {/* Select All / None Shortcut */}
                    {hasUpdateAccess && (
                      <div 
                        className="text-[10px] uppercase font-semibold cursor-pointer text-muted-foreground hover:text-foreground transition-colors border rounded px-1.5 py-0.5 flex items-center select-none"
                        onClick={() => handleToggleModule(module, !isAllSelected)}
                      >
                        {isAllSelected ? 'Deselect All' : 'Select All'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Permission rows */}
                <div className="divide-y divide-border/40">
                  {perms.map((perm) => {
                    const isChecked = assignedIds.has(perm.id);

                    return (
                      <label
                        key={perm.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleToggle(perm.id, checked === true)
                          }
                          className="shrink-0"
                          disabled={!hasUpdateAccess || !actorCanManageSelectedRole}
                        />
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
            );
          })}
        </div>
      )}
    </div>
  );
}
