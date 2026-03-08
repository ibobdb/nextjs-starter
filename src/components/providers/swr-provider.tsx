'use client';

import { SWRConfig } from 'swr';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateIfStale: false,
        dedupingInterval: 10000, // 10 seconds deduping
        errorRetryCount: 2,
      }}
    >
      {children}
    </SWRConfig>
  );
}
