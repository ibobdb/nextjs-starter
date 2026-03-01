'use client';

/**
 * useData — Generic SWR-based data fetching hook (DBStudio Base)
 *
 * Standarisasi data fetching di seluruh aplikasi.
 * Menggantikan pattern useState + useEffect + useCallback yang berulang.
 *
 * @example Basic usage
 * const { data, isLoading, error } = useData(
 *   'stats-summary',
 *   () => statsApi.getSummary()
 * )
 *
 * @example Dengan transform
 * const { data } = useData(
 *   'growth-metrics',
 *   () => statsApi.getGrowthMetrics(),
 *   { transform: (res) => res.data?.summary ?? [] }
 * )
 *
 * @example Conditional fetch (null key = skip)
 * const { data } = useData(
 *   isAdmin ? 'admin-stats' : null,
 *   () => adminApi.getStats()
 * )
 */

import useSWR from 'swr';

/** Standard API response shape dari semua service ts-worker */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface UseDataOptions<TRaw, TData> {
  /**
   * Transform raw API response ke data yang diinginkan.
   * Default: return `response.data` jika `response.success`, else undefined.
   */
  transform?: (raw: TRaw) => TData;
  /** Interval auto-refresh dalam ms. Default: tidak auto-refresh */
  refreshInterval?: number;
  /** Revalidate saat window focus. Default: false */
  revalidateOnFocus?: boolean;
}

export function useData<TData, TRaw = ApiResponse<TData>>(
  /** SWR cache key. Pass null untuk skip fetch. */
  key: string | null,
  /** Fungsi fetcher yang return Promise */
  fetcher: () => Promise<TRaw>,
  options: UseDataOptions<TRaw, TData> = {}
) {
  const {
    transform,
    refreshInterval,
    revalidateOnFocus = false,
  } = options;

  const { data: raw, isLoading, error, mutate } = useSWR<TRaw>(
    key,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus,
      shouldRetryOnError: false,
    }
  );

  // Transform data jika ada transform function
  let data: TData | undefined;
  if (raw !== undefined) {
    if (transform) {
      data = transform(raw);
    } else {
      // Default: ambil .data dari ApiResponse jika success
      const asApiRes = raw as unknown as ApiResponse<TData>;
      data = asApiRes?.success ? asApiRes.data : undefined;
    }
  }

  return {
    /** Data hasil fetch (sudah di-transform jika ada transform option) */
    data,
    /** True saat initial load (belum ada data sama sekali) */
    isLoading,
    /** Error object jika fetch gagal */
    error,
    /** Trigger manual refetch / revalidate */
    mutate,
    /** Shorthand untuk mutate() */
    refetch: () => mutate(),
    /** True jika ada error */
    isError: !!error,
  };
}
