'use client';

import React, { createContext, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useTasks } from './useTasks';
import { useNotifications } from './useNotifications';
import { NotificationContextType } from './types';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { tasks, isLoading: isLoadingTasks, mutate: refreshTasks } = useTasks();
  const { 
    notifications, 
    isLoading: isLoadingNotifications, 
    markAsRead, 
    markAllAsRead, 
    mutate: refreshNotifications 
  } = useNotifications();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const refresh = useCallback(async () => {
    await Promise.all([refreshTasks(), refreshNotifications()]);
  }, [refreshTasks, refreshNotifications]);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: NodeJS.Timeout;

    const connect = () => {
      eventSource = new EventSource('/api/stream/events');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'task-completed' || data.type === 'broadcast') {
            refresh();
          }
        } catch (e) {
          console.error('[SSE] Parsing error', e);
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
        retryTimeout = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      eventSource?.close();
      clearTimeout(retryTimeout);
    };
  }, [refresh]);

  return (
    <NotificationContext.Provider
      value={{
        tasks,
        notifications,
        unreadCount,
        isLoadingTasks,
        isLoadingNotifications,
        markAsRead,
        markAllAsRead,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationSystem() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationSystem must be used within a NotificationProvider');
  }
  return context;
}
