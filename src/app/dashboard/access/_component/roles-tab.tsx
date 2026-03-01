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

const PROTECTED_ROLES = ['super_admin', 'admin'];

export function RolesTab() {
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
      toast.success(`Role "${newRoleName}" berhasil dibuat`);
      setNewRoleName('');
      setShowCreate(false);
      refetch();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal membuat role');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await accessApi.deleteRole(deleteTarget.id);
      toast.success(`Role "${deleteTarget.name}" dihapus`);
      setDeleteTarget(null);
      refetch();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal menghapus role');
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
              disabled={isProtected}
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
      <PageHeader
        title="Roles"
        description="Kelola role yang tersedia di sistem."
        actions={
          <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5" />
            Tambah Role
          </Button>
        }
      />

      <AppTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="Belum ada role"
        emptyDescription="Tambahkan role pertama untuk memulai."
        emptyIcon={<Shield className="h-7 w-7 text-muted-foreground/60" />}
      />

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Role Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 py-2">
            <Input
              placeholder="Nama role, e.g. editor"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Spasi akan diubah menjadi underscore.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Batal
            </Button>
            <Button onClick={handleCreate} disabled={creating || !newRoleName.trim()}>
              {creating ? 'Membuat...' : 'Buat Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus role &ldquo;{deleteTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Semua user dengan role ini akan kehilangan role tersebut.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
