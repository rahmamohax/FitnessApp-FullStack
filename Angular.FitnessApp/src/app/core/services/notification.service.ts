import { Injectable, signal, computed } from '@angular/core';
import { AppNotification } from '../models/notification.models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSignal = signal<AppNotification[]>([
    {
      id: 1,
      title: 'Workout Time!',
      message: 'Your scheduled Chest & Triceps routine is ready.',
      type: 'workout',
      isRead: false,
      createdAt: '15m ago',
      actionUrl: '/app/workouts/1'
    },
    {
      id: 2,
      title: 'Daily Water Goal',
      message: 'You are 750ml away from completing today’s hydration goal.',
      type: 'reminder',
      isRead: false,
      createdAt: '1h ago',
      actionUrl: '/app/nutrition'
    },
    {
      id: 3,
      title: 'Achievement Unlocked! 🏆',
      message: 'You completed your 7-Day Consistency streak.',
      type: 'achievement',
      isRead: true,
      createdAt: '1d ago',
      actionUrl: '/app/progress'
    }
  ]);

  readonly notifications = this.notificationsSignal.asReadonly();

  readonly unreadCount = computed(() => 
    this.notificationsSignal().filter(n => !n.isRead).length
  );

  markAsRead(id: number): void {
    this.notificationsSignal.update(items =>
      items.map(item => item.id === id ? { ...item, isRead: true } : item)
    );
  }

  markAllAsRead(): void {
    this.notificationsSignal.update(items =>
      items.map(item => ({ ...item, isRead: true }))
    );
  }

  addNotification(notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>): void {
    const newNotification: AppNotification = {
      ...notification,
      id: Date.now(),
      createdAt: 'Just now',
      isRead: false
    };
    this.notificationsSignal.update(items => [newNotification, ...items]);
  }
}
