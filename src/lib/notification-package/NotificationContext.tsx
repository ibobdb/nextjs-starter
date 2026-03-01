'use client';

import React, { createContext, useContext, ReactNode } from 'react';
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

  const refresh = async () => {
    await Promise.all([refreshTasks(), refreshNotifications()]);
  };

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
