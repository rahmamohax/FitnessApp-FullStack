import { Injectable, signal, computed } from '@angular/core';
import { Achievement, ProgressDashboard, ProgressStats, WeightEntry } from '../models/progress.models';
import { WorkoutCompletionRequest } from '../models/workout.models';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private statsSignal = signal<ProgressStats>({
    totalWorkouts: 28,
    totalCaloriesBurned: 14200,
    totalMinutesTrained: 1350,
    currentStreakDays: 7,
    longestStreakDays: 14,
    weightLostKg: 3.5
  });

  private weightHistorySignal = signal<WeightEntry[]>([
    { id: 'w1', weight: 86.0, date: '2026-09-01', notes: 'Initial starting weight' },
    { id: 'w2', weight: 85.2, date: '2026-09-15', notes: 'Post 2-week check-in' },
    { id: 'w3', weight: 84.1, date: '2026-10-01', notes: 'Increased daily cardio' },
    { id: 'w4', weight: 83.2, date: '2026-10-10', notes: 'Clean nutrition adherence' },
    { id: 'w5', weight: 82.5, date: '2026-10-20', notes: 'Current check-in' }
  ]);

  private recentWorkoutsSignal = signal<Array<{
    workoutId: number;
    name: string;
    completedAt: string;
    durationMinutes: number;
    caloriesBurned: number;
  }>>([
    { workoutId: 1, name: 'Chest Hypertrophy & Power', completedAt: 'Today, 07:15 AM', durationMinutes: 45, caloriesBurned: 380 },
    { workoutId: 3, name: 'V-Taper Back & Biceps', completedAt: 'Yesterday, 06:45 PM', durationMinutes: 50, caloriesBurned: 410 },
    { workoutId: 4, name: 'Lower Body Strength & Glutes', completedAt: '2 days ago', durationMinutes: 55, caloriesBurned: 520 },
    { workoutId: 6, name: 'Six-Pack Shred & Core Matrix', completedAt: '3 days ago', durationMinutes: 30, caloriesBurned: 250 }
  ]);

  private achievementsSignal = signal<Achievement[]>([
    {
      id: 'ach_1',
      title: 'First Step',
      description: 'Completed your first recorded workout session.',
      icon: 'fire',
      unlockedAt: 'Sep 02, 2026',
      isUnlocked: true,
      progressPercent: 100
    },
    {
      id: 'ach_2',
      title: '7-Day Unstoppable',
      description: 'Maintained a workout streak for 7 consecutive days.',
      icon: 'trophy',
      unlockedAt: 'Oct 20, 2026',
      isUnlocked: true,
      progressPercent: 100
    },
    {
      id: 'ach_3',
      title: 'Calorie Crusher',
      description: 'Burn a total of 15,000 calories across all sessions.',
      icon: 'zap',
      isUnlocked: false,
      progressPercent: 94
    },
    {
      id: 'ach_4',
      title: 'Iron Discipline',
      description: 'Complete 30 full workout routines.',
      icon: 'dumbbell',
      isUnlocked: false,
      progressPercent: 93
    },
    {
      id: 'ach_5',
      title: 'Hydration Master',
      description: 'Reach 3,000ml water intake 5 days in a row.',
      icon: 'droplet',
      unlockedAt: 'Oct 18, 2026',
      isUnlocked: true,
      progressPercent: 100
    }
  ]);

  readonly stats = this.statsSignal.asReadonly();
  readonly weightHistory = this.weightHistorySignal.asReadonly();
  readonly recentWorkouts = this.recentWorkoutsSignal.asReadonly();
  readonly achievements = this.achievementsSignal.asReadonly();

  readonly dashboard = computed<ProgressDashboard>(() => ({
    stats: this.statsSignal(),
    recentWeightEntries: this.weightHistorySignal(),
    recentWorkouts: this.recentWorkoutsSignal(),
    achievements: this.achievementsSignal()
  }));

  logWeight(weight: number, notes?: string): ApiResponse<WeightEntry> {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: WeightEntry = {
      id: 'w_' + Date.now(),
      weight,
      date: today,
      notes: notes || 'Daily check-in'
    };

    this.weightHistorySignal.update(entries => [...entries, newEntry]);

    // Recalculate weight lost based on first and newest entry
    const entries = this.weightHistorySignal();
    if (entries.length > 1) {
      const lost = Math.round((entries[0].weight - weight) * 10) / 10;
      this.statsSignal.update(s => ({ ...s, weightLostKg: Math.max(0, lost) }));
    }

    return {
      isSuccess: true,
      message: 'Weight logged successfully.',
      data: newEntry,
      statusCode: 201,
      timestamp: new Date().toISOString()
    };
  }

  logWorkoutCompletion(completion: WorkoutCompletionRequest, workoutName: string): ApiResponse<boolean> {
    this.statsSignal.update(s => ({
      ...s,
      totalWorkouts: s.totalWorkouts + 1,
      totalCaloriesBurned: s.totalCaloriesBurned + completion.caloriesBurned,
      totalMinutesTrained: s.totalMinutesTrained + completion.durationInMinutes
    }));

    this.recentWorkoutsSignal.update(list => [
      {
        workoutId: completion.workoutId,
        name: workoutName,
        completedAt: 'Just now',
        durationMinutes: completion.durationInMinutes,
        caloriesBurned: completion.caloriesBurned
      },
      ...list
    ]);

    return {
      isSuccess: true,
      message: 'Workout completion recorded successfully.',
      data: true,
      statusCode: 201,
      timestamp: new Date().toISOString()
    };
  }
}
