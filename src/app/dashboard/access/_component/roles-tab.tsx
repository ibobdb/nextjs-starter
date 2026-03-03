'use client';

import { useState } from 'react';
import { Trash2, Plus, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { AppTable } from '@/components/common/app-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useData } from '@/hooks/use-data';
import { accessApi, type Role } from '@/services/access/api';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { usePermission } from '@/lib/rbac/hooks/usePermission';
import { useSession } from '@/hooks/use-session';
import { PermissionAlert } from '@/components/common/permission-alert';

const PROTECTED_ROLES = ['super_admin', 'admin'];

export function RolesTab() {
  const { user } = useSession();
  const { allowed: canCreate } = usePermission('user.create');
  const { allowed: canDelete } = usePermission('user.delete');
  const isSuperAdmin = user?.roles?.includes('super_admin');
  
  const hasCreateAccess = isSuperAdmin || canCreate;
  const hasDeleteAccess = isSuperAdmin || canDelete;

  const { data: roles = [], isLoading, error, refetch } = useData<Role[]>(
    'access-roles',
    () => accessApi.getRoles(),
    { transform: (res) => res.data! }
  );

  const [showCreate, setShowCreate] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async () => {
    if (!newRoleName.trim()) return;
    setCreating(true);
    try {
      await accessApi.createRole(newRoleName);
      toast.success(`Role "${newRoleName}" created successfully`);
      setNewRoleName('');
      setShowCreate(false);
      refetch();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create role');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await accessApi.deleteRole(deleteTarget.id);
      toast.success(`Role "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      refetch();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete role');
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: 'name',
      header: 'Role Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="font-mono text-sm font-medium">{row.original.name}</span>
          {PROTECTED_ROLES.includes(row.original.name) && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
              built-in
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: '_count.rolePermissions',
      header: 'Permissions',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original._count?.rolePermissions ?? 0} permissions
        </span>
      ),
    },
    {
      accessorKey: '_count.userRoles',
      header: 'Users',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original._count?.userRoles ?? 0} users
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const isProtected = PROTECTED_ROLES.includes(row.original.name);
        return (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              disabled={isProtected || !hasDeleteAccess}
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
        <PermissionAlert 
          message="You do not have permission to manage (add/delete) roles. Please contact an administrator for role management access."
        />

      <PageHeader
        title="Roles"
        description="Manage available roles in the system."
        actions={
          hasCreateAccess && (
            <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add Role
            </Button>
          )
        }
      />

      <AppTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No roles yet"
        emptyDescription="Add your first role to get started."
        emptyIcon={<Shield className="h-7 w-7 text-muted-foreground/60" />}
      />

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 py-2">
            <Input
              placeholder="Role name, e.g. editor"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Spaces will be converted to underscores.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || !newRoleName.trim()}>
              {creating ? 'Creating...' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role &ldquo;{deleteTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All users with this role will lose it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
