import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ActivityLevel, FitnessGoal, Gender, SubmitFitnessStatsRequest } from '../../core/models/fce.models';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { FceService } from '../../core/services/fce.service';

@Component({
  selector: 'app-questionnaire',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './questionnaire.html',
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class QuestionnaireComponent {
  private profileService = inject(ProfileService);
  private fceService = inject(FceService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  Gender = Gender;

  currentStep = signal<number>(1);
  isSubmitting = signal<boolean>(false);

  // Stats state
  gender = signal<Gender>(Gender.Male);
  age = signal<number>(25);
  weightKg = signal<number>(82.5);
  weightUnit = signal<'kg' | 'lbs'>('kg');
  heightCm = signal<number>(178);
  goal = signal<FitnessGoal>(FitnessGoal.GetFitter);
  activityLevel = signal<ActivityLevel>(ActivityLevel.Intermediate);

  ageOptions = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 35, 40];

  goalOptions = [
    { value: FitnessGoal.LoseWeight, label: 'Lose Weight', description: 'Burn body fat & increase lean muscle definition', icon: '🔥' },
    { value: FitnessGoal.GetFitter, label: 'Get Fitter & Tone', description: 'Boost cardiovascular health & athletic agility', icon: '⚡' },
    { value: FitnessGoal.GainWeight, label: 'Gain Weight / Mass', description: 'Hypertrophy resistance program to pack on muscle mass', icon: '💪' },
    { value: FitnessGoal.GainMoreFlexible, label: 'Gain More Flexible', description: 'Mobility, core balance, and dynamic stretching', icon: '🧘' },
    { value: FitnessGoal.LearnTheBasic, label: 'Learn the Basics', description: 'Master foundational gym movements with safe form', icon: '🎯' }
  ];

  activityOptions = [
    { value: ActivityLevel.Rookie, label: 'Rookie', badge: 'Sedentary', description: 'Desk job, minimal daily walking or exercise' },
    { value: ActivityLevel.Beginner, label: 'Beginner', badge: 'Light', description: '1-2 light workout sessions per week' },
    { value: ActivityLevel.Intermediate, label: 'Intermediate', badge: 'Moderate', description: '3-4 consistent workout sessions per week' },
    { value: ActivityLevel.Advance, label: 'Advance', badge: 'Active', description: '5-6 intense sports or gym training sessions' },
    { value: ActivityLevel.TrueBeast, label: 'True Beast', badge: 'Heavy', description: 'Twice-a-day athlete training or heavy physical labor' }
  ];

  displayWeight(): number {
    if (this.weightUnit() === 'lbs') {
      return Math.round(this.weightKg() * 2.20462);
    }
    return this.weightKg();
  }

  onAgeChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.age.set(val);
  }

  onWeightChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.weightKg.set(val);
  }

  onHeightChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.heightCm.set(val);
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  nextStep(): void {
    if (this.currentStep() < 6) {
      this.currentStep.update(s => s + 1);
    } else {
      this.finishQuestionnaire();
    }
  }

  finishQuestionnaire(): void {
    if (this.isSubmitting()) return;

    this.isSubmitting.set(true);

    const stats: SubmitFitnessStatsRequest = {
      gender: this.gender(),
      age: this.age(),
      weight: this.weightKg(),
      height: this.heightCm(),
      goal: this.goal(),
      activityLevel: this.activityLevel()
    };

    this.fceService.calibrateAndAssignPlan(stats).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        const planName = response.data?.planName || 'Personalized Fitness Plan';
        this.toastService.success(`Assigned plan: "${planName}". Welcome to Super Fitness!`,
          'Profile Calibrated'
        );
        this.router.navigate(['/app/home']);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  skipToApp(): void {
    this.authService.completeProfileOnboarding();
    this.router.navigate(['/app/home']);
  }
}
