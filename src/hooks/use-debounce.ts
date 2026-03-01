'use client';

/**
 * useDebounce — Debounce value hook (DBStudio Base)
 *
 * Menunda update nilai hingga user berhenti mengetik.
 * Sangat berguna untuk search input agar tidak trigger fetch di setiap keystroke.
 *
 * @example Search dengan debounce
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebounce(search, 400)
 *
 * // fetch hanya dipanggil saat debouncedSearch berubah
 * const { data } = useData(
 *   debouncedSearch ? `topics?q=${debouncedSearch}` : 'topics',
 *   () => topicsApi.search(debouncedSearch)
 * )
 */

import { useState, useEffect } from 'react';

/**
 * @param value  Nilai yang ingin di-debounce
 * @param delay  Delay dalam ms. Default: 300ms
 * @returns      Nilai yang sudah di-debounce
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
