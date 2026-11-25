import { Injectable, signal, computed, inject } from '@angular/core';
import { Achievement, BackendLogWeightRequest, BackendWorkoutCompletionRequest, ProgressDashboard, ProgressStats, ViewProgressDashboardResponse, WeightEntry, WorkOutCompletionResponse } from '../models/progress.models';
import { WorkoutCompletionRequest } from '../models/workout.models';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private readonly apiUrl = `${environment.apiUrl}/progress`;
  private http = inject(HttpClient);

  private statsSignal = signal<ProgressStats>({
    totalWorkouts: 0,
    totalCaloriesBurned: 0,
    totalMinutesTrained: 0,
    currentStreakDays: 0,
    longestStreakDays: 0,
    weightLostKg: 0
  });

  private weightHistorySignal = signal<WeightEntry[]>([]);

  private recentWorkoutsSignal = signal<Array<{
    workoutId: number;
    name: string;
    completedAt: string;
    durationMinutes: number;
    caloriesBurned: number;
  }>>([]);

  private achievementsSignal = signal<Achievement[]>([]);

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

  constructor() {
    // Automatically load live progress data on startup
    if (typeof window !== 'undefined') {
      this.loadDashboard().subscribe();
    }
  }

  loadDashboard(): Observable<ProgressDashboard> {
    return this.http.get<ApiResponse<ViewProgressDashboardResponse>>(this.apiUrl).pipe(
      map(res => {
        const d = res.data;
        if(!d) return this.dashboard();

        const totalMinutes = (d.workoutHistory || []).reduce((acc, w) => acc + w.durationInMinutes, 0);

        const stats: ProgressStats = {
          totalWorkouts: d.statisticsSummary?.totalWorkouts ?? (d.workoutHistory?.length || 0),
          totalCaloriesBurned: d.statisticsSummary?.totalCaloriesBurned ?? 0,
          totalMinutesTrained: totalMinutes,
          currentStreakDays: 0,
          longestStreakDays: 0,
          weightLostKg: Math.round((d.statisticsSummary?.totalWeightLost ?? 0) * 10) / 10    
        };

        const weightEntries: WeightEntry[] = (d.weightHistory || [])
        .map((w, idx) => ({
          id: `w_${idx}_${new Date(w.date).getTime()}`,
          weight: w.weight,
          date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          notes: w.notes || 'Checkpoint'
        }));

        const workouts = (d.workoutHistory || []).map(w => ({
          workoutId: w.id,
          name: `Workout #${w.id}`,
          completedAt: new Date(w.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          durationMinutes: w.durationInMinutes,
          caloriesBurned: w.caloriesBurned
        }));

        const achievements: Achievement[] = (d.achievements || []).map((a, idx) => ({
          id: `ach_${a.achievementId || idx}`,
          title: a.name,
          description: a.description || 'Milestone achieved along your progression.',
          icon: this.mapAchievementIcon(a.name),
          unlockedAt: a.earnedAt ? new Date(a.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : undefined,
          isUnlocked: true,
          progressPercent: 100
        }));

        this.statsSignal.set(stats);
        this.weightHistorySignal.set(weightEntries);
        this.recentWorkoutsSignal.set(workouts);
        this.achievementsSignal.set(achievements);

        return {
          stats,
          recentWeightEntries: weightEntries,
          recentWorkouts: workouts,
          achievements
        };
      }),
      catchError(() => of(this.dashboard()))         
    );
  }

  logWeight(weight: number, notes?: string): Observable<ApiResponse<any>> {
    const today = new Date().toISOString().split('T')[0];
    const payload: BackendLogWeightRequest = {
      weight,
      date: today,
      notes: notes || 'Daily check-in'
    };

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/weight`, payload)
      .pipe(
        tap(res => {
          if(res.isSuccess) {
            const newEntry : WeightEntry ={
              id: 'w_' + Date.now(),
              weight,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              notes: notes || 'Daily check-in'
            };
            this.weightHistorySignal.update(entries => [newEntry, ...entries]);

            const entries = this.weightHistorySignal();
            if (entries.length > 1){
              const lost = Math.round((entries[entries.length - 1].weight - weight) * 10) / 10;
              this.statsSignal.update(s => ({...s, weightLostKg: Math.max(0, lost)}));
            }
          }
        })
      );
  }

  logWorkoutCompletion(completion: WorkoutCompletionRequest, workoutName: string): Observable<ApiResponse<WorkOutCompletionResponse>> {
    const payload: BackendWorkoutCompletionRequest = {
      workoutId: completion.workoutId,
      sessionId: completion.sessionId || `sess_${Date.now()}`,
      durationInMinutes: completion.durationInMinutes,
      caloriesBurned: completion.caloriesBurned,
      rating: completion.rating ?? 5,
      notes: completion.notes || 'Workout completed successfully',
      exercisesCompleted: []
    };
    return this.http.post<ApiResponse<WorkOutCompletionResponse>>(`${this.apiUrl}/workouts`, payload).pipe(
      tap(res => {
        // Optimistically update live statistics
        this.statsSignal.update(s => ({
          ...s,
          totalWorkouts: s.totalWorkouts + 1,
          totalCaloriesBurned: s.totalCaloriesBurned + completion.caloriesBurned,
          totalMinutesTrained: s.totalMinutesTrained + completion.durationInMinutes,
          currentStreakDays: res.data?.currentStreak ?? (s.currentStreakDays + 1)
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
      })
    );
  }

    private mapAchievementIcon(name: string): string {
    const n = (name || '').toLowerCase();
    if (n.includes('streak') || n.includes('week') || n.includes('day')) return 'trophy';
    if (n.includes('calorie') || n.includes('burn')) return 'fire';
    if (n.includes('water') || n.includes('hydration')) return 'droplet';
    if (n.includes('strength') || n.includes('weight') || n.includes('reps')) return 'dumbbell';
    return 'zap';
  }
}
