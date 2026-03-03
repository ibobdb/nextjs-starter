export type TaskStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface Task {
  id: string;
  externalJobId?: string | null;
  title: string;
  status: TaskStatus;
  metadata?: Record<string, unknown>;
  createdAt: string; // From API JSON
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationContextType {
  tasks: Task[];
  notifications: Notification[];
  unreadCount: number;
  isLoadingTasks: boolean;
  isLoadingNotifications: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}
