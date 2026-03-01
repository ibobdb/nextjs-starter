'use client';

import useSWR from 'swr';
import { Notification } from './types';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useNotifications(page = 1, limit = 50) {
  const { data, error, mutate, isLoading } = useSWR(`/api/notifications?page=${page}&limit=${limit}`, fetcher, {
    refreshInterval: 30000, 
  });

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) mutate();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) mutate();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) mutate();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) mutate();
    } catch (err) {
      console.error('Failed to delete all notifications:', err);
    }
  };

  return {
    notifications: (data?.data || []) as Notification[],
    meta: data?.meta as { total: number; page: number; limit: number; totalPages: number } | undefined,
    isLoading,
    isError: error,
    mutate,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
}
