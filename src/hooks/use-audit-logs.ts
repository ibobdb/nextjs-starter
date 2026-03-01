import useSWR from 'swr';

export interface AuditLog {
  id: string;
  userId?: string;
  user?: { name: string; email: string };
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface AuditLogResponse {
  success: boolean;
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
  message?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAuditLogs(page: number = 1, limit: number = 20, filters?: { action?: string, entity?: string }) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.action) queryParams.append("action", filters.action);
  if (filters?.entity) queryParams.append("entity", filters.entity);

  const { data, error, isLoading, mutate } = useSWR<AuditLogResponse>(
    `/api/logs?${queryParams.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    logs: data?.data || [],
    meta: data?.meta,
    isLoading,
    error: error || (data && !data.success ? data.message : null),
    mutate,
  };
}
