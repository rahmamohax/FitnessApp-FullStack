import { Injectable, signal, computed, inject } from '@angular/core';
import { AppNotification, BackendNotificationResponse, MarkNotificationReadResponse } from '../models/notification.models';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { catchError, map, Observable, of } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

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

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.fetchNotifications().subscribe();
    }
  }

  fetchNotifications(): Observable<AppNotification[]> {
    return this.http.get<ApiResponse<BackendNotificationResponse[]>>(`${this.apiUrl}`)
    .pipe(
      map(res => {
        const rawList = res.data || [];
        const mapped: AppNotification[] = rawList.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          isRead: n.isRead,
          type: this.deriveType(n.title, n.message),
          createdAt: 'Recently'
        }));
        this.notificationsSignal.set(mapped);
        return mapped;
      }),
      catchError(() => of(this.notificationsSignal()))
    );
  }

  markAsRead(id: number): Observable<ApiResponse<MarkNotificationReadResponse> | null> {
    this.notificationsSignal.update(items =>
      items.map(item => item.id === id ? { ...item, isRead: true } : item)
    );

    return this.http.put<ApiResponse<MarkNotificationReadResponse>>(`${this.apiUrl}/${id}/read`, {})
      .pipe(
        catchError(() => of(null))
      );
  }

  markAllAsRead(): void {
    const unread = this.notificationsSignal().filter(n => !n.isRead);
    this.notificationsSignal.update(items =>
      items.map(item => ({ ...item, isRead: true }))
    );

    unread.forEach(n => {
      this.http.put<ApiResponse<MarkNotificationReadResponse>>(`${this.apiUrl}/${n.id}/read`, {}).subscribe();
    });
  }

  addNotification(notification: Omit<AppNotification, 'id' | 'isRead'>): void {
    const newNotification: AppNotification = {
      ...notification,
      id: Date.now(),
      createdAt: Date.now().toString(),
      isRead: false
    };
    this.notificationsSignal.update(items => [newNotification, ...items]);
  }

  private deriveType(title: string, message: string): AppNotification['type'] {
    const text = `${title} ${message}`.toLowerCase();
    if (text.includes('workout') || text.includes('routine') || text.includes('exercise')) return 'workout';
    if (text.includes('water') || text.includes('nutrition') || text.includes('meal') || text.includes('calorie')) return 'nutrition';
    if (text.includes('achievement') || text.includes('streak') || text.includes('trophy') || text.includes('badge')) return 'achievement';
    return 'reminder';
  }
}
