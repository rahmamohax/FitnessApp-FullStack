import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ActivityLevel, FitnessGoal, Gender } from '../../core/models/fce.models';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ExitModalComponent } from '../../shared/components/exit-modal/exit-modal.component';
import { UserProfile } from '../../core/models/profile.models';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, IconComponent, ExitModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.html'
})
export class ProfileComponent implements OnInit {
  profileService = inject(ProfileService);
  authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  isUploadingPicture = signal<boolean>(false);
  openEditInfoModal = signal<boolean>(false);
  openEditWeightModal = signal<boolean>(false);
  openEditGoalModal = signal<boolean>(false);
  openEditActivityModal = signal<boolean>(false);
  openSubscriptionModal = signal<boolean>(false);
  openExitModal = signal<boolean>(false);

  // Form values
  editFirstName = this.profileService.profile().firstName;
  editLastName = this.profileService.profile().lastName;
  editEmail = this.profileService.profile().email;
  editPhone = this.profileService.profile().phoneNumber;
  editWeightValue = this.profileService.profile().weight;
  editGoalValue = this.profileService.profile().goal;
  editActivityValue = this.profileService.profile().activityLevel;

  goalChoices = [
    { value: FitnessGoal.LoseWeight, label: 'Lose Weight & Cut Fat' },
    { value: FitnessGoal.GetFitter, label: 'Get Fitter & Athletic' },
    { value: FitnessGoal.GainWeight, label: 'Gain Muscle Mass' },
    { value: FitnessGoal.GainMoreFlexible, label: 'Flexibility & Core Mobility' },
    { value: FitnessGoal.LearnTheBasic, label: 'Learn Exercise Basics' }
  ];

  activityChoices = [
    { value: ActivityLevel.Rookie, label: 'Rookie', desc: 'Sedentary work, little daily activity' },
    { value: ActivityLevel.Beginner, label: 'Beginner', desc: '1-2 light training sessions/week' },
    { value: ActivityLevel.Intermediate, label: 'Intermediate', desc: '3-4 vigorous workouts/week' },
    { value: ActivityLevel.Advance, label: 'Advance', desc: '5-6 heavy training sessions/week' },
    { value: ActivityLevel.TrueBeast, label: 'True Beast', desc: 'Heavy athletic double days' }
  ];

  ngOnInit(): void {
    // Sync initial edit fields if cached
    const currentUser = this.authService.currentUser();
    if (!currentUser?.isProfileComplete) {
      this.router.navigate(['/questionnaire']);
      return;
    }

    const p = this.profileService.profile();
    this.syncEditFields(p);

    // Fetch live profile, biometric stats, and metrics from the microservices
    this.profileService.loadProfile().subscribe({
      next: (profile) => {
        this.syncEditFields(profile);
      },
    });

    this.profileService.loadSettings().subscribe();
  }

  private syncEditFields(p: UserProfile): void {
    if (!p) return;
    this.editFirstName = p.firstName || '';
    this.editLastName = p.lastName || '';
    this.editEmail = p.email || '';
    this.editPhone = p.phoneNumber || '';
    if (p.weight > 0) this.editWeightValue = p.weight;
    if (p.goal !== FitnessGoal.None) this.editGoalValue = p.goal;
    if (p.activityLevel !== ActivityLevel.None) this.editActivityValue = p.activityLevel;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.toastService.error('Please select an image file (PNG, JPG, WEBP).', 'Invalid File');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.toastService.error('File size exceeds the 10MB limit.', 'File Too Large');
      return;
    }

    this.isUploadingPicture.set(true);

    this.profileService.uploadProfilePicture(file).subscribe({
      next: () => {
        this.isUploadingPicture.set(false);
        this.toastService.success('Profile picture updated successfully!', 'Avatar Updated');
      },
      error: () => {
        this.isUploadingPicture.set(false);
      },
    });
  }

  saveProfileInfo(): void {
    this.profileService.updateProfile({
      firstName: this.editFirstName,
      lastName: this.editLastName,
      email: this.editEmail,
      phoneNumber: this.editPhone
    }).subscribe({
      next: () => {
        this.toastService.success('Profile details updated successfully.', 'Profile Saved');
        this.openEditInfoModal.set(false);
      },
    });
  }

  saveWeight(): void {
    const newWeight = Number(this.editWeightValue);
    this.profileService.updateMetrics({ weight: newWeight }).subscribe({
      next: () => {
        this.toastService.success(`Weight updated to ${newWeight} kg. Metrics recalibrated!`, 'Metrics Updated');
        this.openEditWeightModal.set(false);
      },
    });
  }

  saveGoal(): void {
    this.profileService.updateMetrics({ goal: this.editGoalValue }).subscribe({
      next: () => {
        this.toastService.success(`Fitness goal set to "${this.editGoalValue}"!`, 'Goal Updated');
        this.openEditGoalModal.set(false);
      },
    });
  }

  saveActivity(): void {
    this.profileService.updateMetrics({ activityLevel: this.editActivityValue }).subscribe({
      next: () => {
        this.toastService.success(`Activity level adjusted to "${this.editActivityValue}"!`, 'Activity Recalibrated');
        this.openEditActivityModal.set(false);
      },
    });
  }

  toggleSetting(key: 'notificationsEnabled' | 'soundEffects'): void {
    const current = this.profileService.settings()[key];
    this.profileService.updateSettings({ [key]: !current }).subscribe({
      next: () => this.toastService.info('Preferences updated'),
    });
  }

  changeUnit(unit: 'metric' | 'imperial'): void {
    this.profileService.updateSettings({ units: unit }).subscribe({
      next: () => this.toastService.info(`Units switched to ${unit}`),
    });
  }
  confirmSignOut(): void {
    this.openExitModal.set(false);
    this.authService.logout();
    this.toastService.info('You have logged out.');
  }

  upgradeTier(tier: 'Pro' | 'Elite'): void {
    this.profileService.upgradeSubscription(tier);
    this.toastService.success(`You are now on the ${tier} membership tier!`, 'Upgraded');
    this.openSubscriptionModal.set(false);
  }
}
