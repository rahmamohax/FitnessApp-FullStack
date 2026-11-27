export interface BackendNotificationResponse {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
}

export interface MarkNotificationReadResponse {
  id: number;
  isRead: boolean;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type?: 'workout' | 'nutrition' | 'achievement' | 'reminder';
  isRead: boolean;
  createdAt?: string;
  actionUrl?: string;
}