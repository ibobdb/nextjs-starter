'use client';

/**
 * useDataTable — Unified table state management hook (DBStudio Base)
 *
 * Two modes in one hook:
 *
 * @example Client mode (all data in memory, filter/sort/paginate in browser)
 * ```ts
 * const dt = useDataTable({ mode: 'client', data: myArray, columns })
 * <DataTable {...dt} />
 * ```
 *
 * @example Server mode (fetcher called with query params on every state change)
 * ```ts
 * const dt = useDataTable({ mode: 'server', fetcher: myApi.list, columns })
 * <DataTable {...dt} />
 * ```
 */

import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type Table,
} from '@tanstack/react-table';
import useSWR from 'swr';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface DataTableState {
  search: string;
  sorting: SortingState;
  page: number;
  pageSize: number;
  rowSelection: RowSelectionState;
}

export interface DataTablePagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  setPage: (p: number) => void;
  setPageSize: (s: number) => void;
}

export interface DataTableOutput<TData> {
  table: Table<TData>;
  state: DataTableState;
  pagination: DataTablePagination;
  isLoading: boolean;
  error: Error | null;
  /** Selected row data objects */
  selectedRows: TData[];
  /** Clears all row selections */
  clearSelection: () => void;
  /** Actions for the toolbar */
  toolbar: {
    search: string;
    setSearch: (v: string) => void;
  };
}

// ─── Server fetcher params ──────────────────────────────────────────────────

export interface ServerFetchParams {
  page: number;
  pageSize: number;
  search: string;
  sortField?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ServerFetchResult<TData> {
  data: TData[];
  total: number;
}

// ─── Options ───────────────────────────────────────────────────────────────

type ClientOptions<TData> = {
  mode: 'client';
  data: TData[];
  columns: ColumnDef<TData>[];
  defaultPageSize?: number;
};

type ServerOptions<TData> = {
  mode: 'server';
  fetcher: (params: ServerFetchParams) => Promise<ServerFetchResult<TData>>;
  columns: ColumnDef<TData>[];
  defaultPageSize?: number;
};

export type UseDataTableOptions<TData> = ClientOptions<TData> | ServerOptions<TData>;

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useDataTable<TData>(
  options: UseDataTableOptions<TData>
): DataTableOutput<TData> {
  const { mode, columns, defaultPageSize = 10 } = options;

  const [search, setSearchRaw] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Reset to page 1 when search or sort changes (avoid stale pages)
  const prevSearch = useRef(search);
  const prevSorting = useRef(sorting);
  useEffect(() => {
    if (prevSearch.current !== search || prevSorting.current !== sorting) {
      setPage(1);
      prevSearch.current = search;
      prevSorting.current = sorting;
    }
  }, [search, sorting]);

  const setSearch = useCallback((v: string) => {
    setSearchRaw(v);
    setPage(1);
  }, []);

  // ── Client mode ────────────────────────────────────────────────────────
  const clientData = mode === 'client' ? options.data : [];

  const firstSort = sorting[0];
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<TData>({
    data: mode === 'client' ? clientData : ([] as TData[]),
    columns,
    state: {
      sorting,
      globalFilter: search,
      rowSelection,
      pagination: { pageIndex: page - 1, pageSize },
    },
    // Client: use built-in models
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: mode === 'client' ? getSortedRowModel() : undefined as never,
    getFilteredRowModel: mode === 'client' ? getFilteredRowModel() : undefined as never,
    getPaginationRowModel: mode === 'client' ? getPaginationRowModel() : undefined as never,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: (v) => setSearchRaw(typeof v === 'string' ? v : ''),
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const next = updater({ pageIndex: page - 1, pageSize });
        setPage(next.pageIndex + 1);
        setPageSize(next.pageSize);
      }
    },
    manualPagination: mode === 'server',
    manualSorting: mode === 'server',
    manualFiltering: mode === 'server',
    enableRowSelection: true,
    pageCount: -1, // will be overridden for server
  });

  // ── Server mode ────────────────────────────────────────────────────────
  const swrKey = mode === 'server'
    ? ['data-table', search, page, pageSize, firstSort?.id, firstSort?.desc]
    : null;

  const { data: serverResult, isLoading: serverLoading, error: serverError } =
    useSWR<ServerFetchResult<TData>>(
      swrKey,
      () => {
        if (mode !== 'server') return Promise.resolve({ data: [], total: 0 });
        return options.fetcher({
          page,
          pageSize,
          search,
          sortField: firstSort?.id,
          sortDir: firstSort?.desc ? 'desc' : firstSort ? 'asc' : undefined,
        });
      },
      { revalidateOnFocus: false, shouldRetryOnError: false }
    );

  // For server mode: use a separate table instance with server data
  const serverTableData = serverResult?.data ?? [];
  const serverTotal = serverResult?.total ?? 0;

  const serverTable = useReactTable<TData>({
    data: serverTableData,
    columns,
    state: {
      sorting,
      rowSelection,
      pagination: { pageIndex: page - 1, pageSize },
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const next = updater({ pageIndex: page - 1, pageSize });
        setPage(next.pageIndex + 1);
        setPageSize(next.pageSize);
      }
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableRowSelection: true,
    pageCount: Math.ceil(serverTotal / pageSize) || 1,
  });

  const activeTable = mode === 'server' ? serverTable : table;

  const clientTotal = mode === 'client'
    ? table.getFilteredRowModel().rows.length
    : 0;
  const total = mode === 'server' ? serverTotal : clientTotal;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const selectedRows = useMemo(() => {
    return activeTable
      .getSelectedRowModel()
      .rows.map((r) => r.original);
  }, [activeTable, rowSelection]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearSelection = useCallback(() => setRowSelection({}), []);

  const state: DataTableState = { search, sorting, page, pageSize, rowSelection };

  const pagination: DataTablePagination = {
    page,
    pageSize,
    total,
    totalPages,
    setPage,
    setPageSize,
  };

  return {
    table: activeTable,
    state,
    pagination,
    isLoading: mode === 'server' ? serverLoading : false,
    error: mode === 'server' ? (serverError ?? null) : null,
    selectedRows,
    clearSelection,
    toolbar: { search, setSearch },
  };
}
