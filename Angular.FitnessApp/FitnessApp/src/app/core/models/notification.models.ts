export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: 'workout' | 'nutrition' | 'achievement' | 'reminder';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}
