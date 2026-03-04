'use client';

/**
 * DataTable — Full-featured table component (DBStudio Base)
 *
 * Assembles: toolbar (search + actions) + table (with selection) + pagination
 * Driven by the `useDataTable` hook — client or server mode.
 *
 * @example
 * ```tsx
 * const dt = useDataTable({ mode: 'client', data, columns })
 *
 * <DataTable
 *   {...dt}
 *   searchPlaceholder="Search employees..."
 *   actions={<Button>Add Employee</Button>}
 *   bulkActions={<Button variant="destructive">Delete Selected</Button>}
 * />
 * ```
 */

import {
  flexRender,
  type RowData,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableToolbar } from './data-table-toolbar';
import { DataTablePagination } from './data-table-pagination';
import { DataLoader } from '@/components/ui/data-loader';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { cn } from '@/lib/utils';
import type { DataTableOutput } from '@/hooks/use-data-table';
import type { ReactNode } from 'react';

// Make sure TData extends {} for RowData compatibility
interface DataTableProps<TData extends RowData> extends DataTableOutput<TData> {
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Actions shown when no rows are selected (e.g. Create button) */
  actions?: ReactNode;
  /** Actions shown when rows are selected (bulk operations) */
  bulkActions?: ReactNode;
  /** Extra content below the toolbar (e.g. filter chips) */
  filters?: ReactNode;
  /** Rows per page options. Default: [10, 20, 50, 100] */
  pageSizeOptions?: number[];
  /** Empty state title */
  emptyTitle?: string;
  /** Empty state description */
  emptyDescription?: string;
  /** Empty state icon */
  emptyIcon?: ReactNode;
  /** Additional className for the root div */
  className?: string;
  /** Whether rows have checkboxes. Default: true */
  enableSelection?: boolean;
  /** Number of skeleton rows during loading. Default: 8 */
  skeletonRows?: number;
}

export function DataTable<TData extends RowData>({
  table,
  pagination,
  isLoading,
  error,
  selectedRows,
  clearSelection,
  toolbar,
  searchPlaceholder,
  actions,
  bulkActions,
  filters,
  pageSizeOptions,
  emptyTitle = 'No results found',
  emptyDescription = 'Try adjusting your search or filters.',
  emptyIcon,
  className,
  enableSelection = true,
  skeletonRows = 8,
}: DataTableProps<TData>) {
  const rows = table.getRowModel().rows;
  const allPageSelected = table.getIsAllPageRowsSelected();
  const somePage = table.getIsSomePageRowsSelected();

  if (error) {
    return <ErrorState title="Failed to load data" description={error.message} />;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Toolbar */}
      <DataTableToolbar
        search={toolbar.search}
        onSearchChange={toolbar.setSearch}
        searchPlaceholder={searchPlaceholder}
        bulkActions={bulkActions}
        selectedCount={selectedRows.length}
        actions={actions}
        isLoading={isLoading}
      />

      {filters && <div>{filters}</div>}

      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        {isLoading ? (
          <DataLoader variant="table" rows={skeletonRows} />
        ) : rows.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            icon={emptyIcon}
          />
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-border/50 bg-muted/30"
                >
                  {enableSelection && (
                    <TableHead className="w-10 pl-4">
                      <Checkbox
                        checked={allPageSelected ? true : somePage ? 'indeterminate' : false}
                        onCheckedChange={(checked) => {
                          table.toggleAllPageRowsSelected(!!checked);
                        }}
                        aria-label="Select all on page"
                        className="translate-y-[1px]"
                      />
                    </TableHead>
                  )}
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
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  className="group hover:bg-muted/30 transition-colors border-border/50 data-[state=selected]:bg-primary/5"
                >
                  {enableSelection && (
                    <TableCell className="w-10 pl-4">
                      <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
                        aria-label="Select row"
                        className="translate-y-[1px]"
                      />
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && (
        <DataTablePagination
          pagination={pagination}
          pageSizeOptions={pageSizeOptions}
        />
      )}

      {/* Selection summary bar */}
      {selectedRows.length > 0 && !bulkActions && (
        <p className="text-xs text-muted-foreground text-right">
          {selectedRows.length} row{selectedRows.length > 1 ? 's' : ''} selected.{' '}
          <button
            onClick={clearSelection}
            className="text-primary hover:underline font-medium"
          >
            Clear
          </button>
        </p>
      )}
    </div>
  );
}
