import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { WorkoutService } from '../../core/services/workout.service';
import { NutritionService } from '../../core/services/nutrition.service';
import { ProgressService } from '../../core/services/progress.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { Workout } from '../../core/models/workout.models';

@Component({
  selector: 'app-home',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class HomeComponent {
  profileService = inject(ProfileService);
  workoutService = inject(WorkoutService);
  nutritionService = inject(NutritionService);
  progressService = inject(ProgressService);
  private toastService = inject(ToastService);

  selectedDayIndex = signal<number>(2); // Default Wednesday / active

  weekDays = [
    { label: 'Mon', date: '19', completed: true },
    { label: 'Tue', date: '20', completed: true },
    { label: 'Wed', date: '21', completed: true },
    { label: 'Thu', date: '22', completed: false },
    { label: 'Fri', date: '23', completed: false },
    { label: 'Sat', date: '24', completed: false },
    { label: 'Sun', date: '25', completed: false }
  ];

  featuredWorkout = () => this.workoutService.workouts()[0];
  popularWorkouts = this.workoutService.workouts().slice(1, 4);

  addWater(): void {
    this.nutritionService.addWater(250);
    this.toastService.success('Added 250ml water intake!', 'Hydration');
  }
}
