'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DataTablePagination as PaginationState } from '@/hooks/use-data-table';

interface DataTablePaginationProps {
  pagination: PaginationState;
  pageSizeOptions?: number[];
}

export function DataTablePagination({
  pagination,
  pageSizeOptions = [10, 20, 50, 100],
}: DataTablePaginationProps) {
  const { page, pageSize, total, totalPages, setPage, setPageSize } = pagination;

  if (total === 0) return null;

  const from = Math.min((page - 1) * pageSize + 1, total);
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
      {/* Left: count + page size */}
      <div className="flex items-center gap-3">
        <span>
          Showing <span className="font-semibold text-foreground">{from}–{to}</span> of{' '}
          <span className="font-semibold text-foreground">{total}</span> results
        </span>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}
        >
          <SelectTrigger className="h-7 w-[70px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((s) => (
              <SelectItem key={s} value={String(s)} className="text-xs">
                {s} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Right: page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPage(1)}
            disabled={page <= 1}
            title="First page"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="px-2 font-medium text-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPage(totalPages)}
            disabled={page >= totalPages}
            title="Last page"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
