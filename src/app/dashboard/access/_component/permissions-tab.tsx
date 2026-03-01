'use client';

import { Key } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { AppTable } from '@/components/common/app-table';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/hooks/use-data';
import { accessApi, type Permission } from '@/services/access/api';
import type { ColumnDef } from '@tanstack/react-table';

const MODULE_COLORS: Record<string, string> = {
  dashboard:   'bg-sky-500/10 text-sky-600 border-sky-500/20',
  user:        'bg-violet-500/10 text-violet-600 border-violet-500/20',
  trendscout:  'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  roles:       'bg-amber-500/10 text-amber-600 border-amber-500/20',
  permissions: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  log:         'bg-slate-500/10 text-slate-500 border-slate-500/20',
  settings:    'bg-pink-500/10 text-pink-600 border-pink-500/20',
};

export function PermissionsTab() {
  const { data, isLoading, error, refetch } = useData<{
    permissions: Permission[];
    grouped: Record<string, Permission[]>;
  }>(
    'access-permissions',
    () => accessApi.getPermissions(),
    { transform: (res) => res.data! }
  );

  const permissions = data?.permissions ?? [];

  const columns: ColumnDef<Permission>[] = [
    {
      accessorKey: 'module',
      header: 'Module',
      cell: ({ row }) => {
        const mod = row.original.module;
        const color = MODULE_COLORS[mod] ?? 'bg-muted text-muted-foreground border-border';
        return (
          <Badge variant="outline" className={`capitalize text-[11px] ${color}`}>
            {mod}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Permission Key',
      cell: ({ row }) => (
        <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
          {row.original.name}
        </code>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground capitalize">
          {row.original.description}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Permissions"
        description="Daftar semua permission yang tersedia. Dikelola via seed/admin."
      />

      <AppTable
        columns={columns}
        data={permissions}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="Belum ada permission"
        emptyIcon={<Key className="h-7 w-7 text-muted-foreground/60" />}
        skeletonRows={8}
      />
    </div>
  );
}
