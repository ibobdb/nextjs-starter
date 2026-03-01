'use client';

/**
 * usePagination — Pagination state management hook (DBStudio Base)
 *
 * Mengelola state pagination: halaman aktif, ukuran halaman, dan offset.
 * Bisa digunakan bersama useData atau AppTable.
 *
 * @example
 * const pagination = usePagination()
 *
 * const { data } = useData(
 *   `topics?page=${pagination.page}&size=${pagination.pageSize}`,
 *   () => topicsApi.getAll({ page: pagination.page, pageSize: pagination.pageSize })
 * )
 *
 * <AppTable data={data} pagination={pagination} />
 */

import { useState, useCallback } from 'react';

interface UsePaginationOptions {
  /** Halaman awal (1-indexed). Default: 1 */
  initialPage?: number;
  /** Jumlah item per halaman. Default: 10 */
  initialPageSize?: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  /** Offset untuk query (0-indexed): (page - 1) * pageSize */
  offset: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  /** Reset ke halaman 1 */
  reset: () => void;
  /** Ubah pageSize dan reset ke halaman 1 */
  changePageSize: (size: number) => void;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
}: UsePaginationOptions = {}): PaginationState {
  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const setPage = useCallback((newPage: number) => {
    setPageState(Math.max(1, newPage));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(Math.max(1, size));
  }, []);

  const reset = useCallback(() => {
    setPageState(initialPage);
  }, [initialPage]);

  const changePageSize = useCallback((size: number) => {
    setPageSizeState(Math.max(1, size));
    setPageState(1); // reset ke halaman 1 saat pageSize berubah
  }, []);

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
    setPage,
    setPageSize,
    reset,
    changePageSize,
  };
}
