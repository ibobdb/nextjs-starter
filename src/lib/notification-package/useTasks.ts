'use client';

import useSWR from 'swr';
import { Task } from './types';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useTasks() {
  const { data, error, mutate, isLoading } = useSWR('/api/tasks', fetcher, {
    // If there are active tasks, poll every 5s; otherwise stop polling (0)
     // Polling will be restarted by manual refresh() call after a trigger
    refreshInterval: (data) => {
      const activeTasks = data?.data || [];
      return activeTasks.length > 0 ? 5000 : 0;
    },
  });

  return {
    tasks: (data?.data || []) as Task[],
    isLoading,
    isError: error,
    mutate,
  };
}
