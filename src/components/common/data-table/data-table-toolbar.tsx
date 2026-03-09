'use client';

import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { ReactNode } from 'react';

interface DataTableToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  /** Action buttons that appear when rows are selected */
  bulkActions?: ReactNode;
  selectedCount?: number;
  /** Extra controls to the right (e.g. filter dropdowns, Create button) */
  actions?: ReactNode;
  isLoading?: boolean;
}

export function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  bulkActions,
  selectedCount = 0,
  actions,
  isLoading,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      {/* Left: search */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9 pr-12 h-9 text-sm"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading && (
            <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
          )}
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: bulk actions (visible when selection > 0) or regular actions */}
      <div className="flex items-center gap-2 shrink-0">
        {selectedCount > 0 && bulkActions ? (
          <div className="flex items-center gap-2 animate-in fade-in-0 slide-in-from-right-2 duration-200">
            <span className="text-xs text-muted-foreground font-medium">
              {selectedCount} selected
            </span>
            {bulkActions}
          </div>
        ) : (
          actions
        )}
      </div>
    </div>
  );
}

// ─── Button group helper (for bulk actions) ─────────────────────────────────
interface DataTableActionGroupProps {
  children: ReactNode;
}

export function DataTableActionGroup({ children }: DataTableActionGroupProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 p-1">
      {children}
    </div>
  );
}
