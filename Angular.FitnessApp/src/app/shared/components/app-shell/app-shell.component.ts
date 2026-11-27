import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ExitModalComponent } from '../exit-modal/exit-modal.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, ExitModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'app-shell.html'
})
export class AppShellComponent {
  authService = inject(AuthService);
  profileService = inject(ProfileService);
  notificationService = inject(NotificationService);
  private router = inject(Router);

  isExitModalOpen = signal<boolean>(false);
  isNotificationsOpen = signal<boolean>(false);

  toggleNotifications(): void {
    this.isNotificationsOpen.update(v => !v);
    if(this.isNotificationsOpen())
      this.notificationService.fetchNotifications().subscribe();
  }

  confirmExit(): void {
    this.isExitModalOpen.set(false);
    this.authService.logout();
  }
}
