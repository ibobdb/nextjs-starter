'use client';

import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Column } from '@tanstack/react-table';
import { cn } from '@/lib/utils';

interface DataTableColumnHeaderProps<TData> {
  column: Column<TData>;
  title: string;
  className?: string;
}

export function DataTableColumnHeader<TData>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData>) {
  if (!column.getCanSort()) {
    return <span className={cn('text-xs font-medium', className)}>{title}</span>;
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => column.toggleSorting(sorted === 'asc')}
      className={cn(
        '-ml-2 h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground',
        sorted && 'text-foreground',
        className
      )}
    >
      {title}
      {sorted === 'asc' ? (
        <ArrowUp className="h-3 w-3" />
      ) : sorted === 'desc' ? (
        <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </Button>
  );
}
