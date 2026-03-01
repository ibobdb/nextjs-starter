'use client';

/**
 * AppTable — Generic reusable table wrapper (DBStudio Base)
 *
 * Wrapper di atas TanStack Table dengan pattern yang konsisten:
 * - Loading state via DataLoader variant="table"
 * - Empty state via EmptyState
 * - Error state via ErrorState
 * - Pagination opsional via usePagination hook
 *
 * @example Basic usage
 * ```tsx
 * const columns: ColumnDef<Topic>[] = [
 *   { accessorKey: 'title', header: 'Title' },
 *   { accessorKey: 'status', header: 'Status',
 *     cell: ({ row }) => <StatusBadge status={row.original.status} /> },
 * ]
 *
 * <AppTable
 *   columns={columns}
 *   data={topics}
 *   isLoading={isLoading}
 * />
 * ```
 *
 * @example Dengan pagination
 * ```tsx
 * const pagination = usePagination()
 * <AppTable
 *   columns={columns}
 *   data={data}
 *   isLoading={isLoading}
 *   pagination={{ ...pagination, total: 120 }}
 * />
 * ```
 */

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataLoader } from '@/components/ui/data-loader';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface PaginationProps {
  page: number;
  pageSize: number;
  /** Total jumlah item (bukan halaman) */
  total: number;
  setPage: (page: number) => void;
}

interface AppTableProps<TData> {
  /** TanStack Table column definitions */
  columns: ColumnDef<TData>[];
  /** Array data yang akan ditampilkan */
  data: TData[];
  /** Tampilkan skeleton loader saat true */
  isLoading?: boolean;
  /** Tampilkan error state saat ada error */
  error?: Error | null;
  /** Callback untuk retry saat error */
  onRetry?: () => void;
  /** Config pagination — opsional */
  pagination?: PaginationProps;
  /** Judul empty state */
  emptyTitle?: string;
  /** Deskripsi empty state */
  emptyDescription?: string;
  /** Icon JSX/ReactNode untuk empty state */
  emptyIcon?: ReactNode;
  /** Action button di empty state */
  emptyAction?: ReactNode;
  /** Jumlah baris skeleton loader. Default: 5 */
  skeletonRows?: number;
  className?: string;
}

export function AppTable<TData>({
  columns,
  data,
  isLoading = false,
  error = null,
  onRetry,
  pagination,
  emptyTitle = 'Tidak ada data',
  emptyDescription,
  emptyIcon,
  emptyAction,
  skeletonRows = 5,
  className,
}: AppTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Pagination di-handle manual via pagination prop
    manualPagination: !!pagination,
  });

  // ── Error state ──────────────────────────────────────────
  if (error) {
    return (
      <ErrorState
        title="Gagal memuat data"
        description={error.message}
        onRetry={onRetry}
        className={className}
      />
    );
  }

  // ── Loading state ─────────────────────────────────────────
  if (isLoading) {
    return <DataLoader variant="table" rows={skeletonRows} className={className} />;
  }

  // ── Empty state ───────────────────────────────────────────
  if (!isLoading && data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    );
  }

  // ── Total pages untuk pagination ──────────────────────────
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1;

  return (
    <div className={cn('space-y-3', className)}>
      {/* ── Table ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-border/50"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="group hover:bg-muted/30 transition-colors border-border/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ────────────────────────────────────── */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            Halaman <span className="font-medium">{pagination.page}</span> dari{' '}
            <span className="font-medium">{totalPages}</span>
            {' '}({pagination.total} item)
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => pagination.setPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => pagination.setPage(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
