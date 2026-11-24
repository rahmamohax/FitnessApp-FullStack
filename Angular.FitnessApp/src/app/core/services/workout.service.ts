import { Injectable, signal, inject } from '@angular/core';
import { BackendStartSessionResponse, BackendWorkoutDetailsViewModel, BackendWorkoutPlanViewModel, BackendWorkoutViewModel, Exercise, StartWorkoutSessionResponse, Workout, WorkoutCompletionRequest, WorkoutDetails, WorkoutPlan } from '../models/workout.models';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private apiUrl = `${environment.apiUrl}`;
  private http = inject(HttpClient);

  private readonly categoryImages: Record<string, string> = {
    chest: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    fullbody: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    back: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=800&q=80',
    legs: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=800&q=80',
    shoulders: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=800&q=80',
    stomach: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
    arms: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
  };
  private workoutsSignal = signal<WorkoutDetails[]>([]);

  private workoutPlansSignal = signal<WorkoutPlan[]>([]);

  readonly workouts = this.workoutsSignal.asReadonly();
  readonly workoutPlans = this.workoutPlansSignal.asReadonly();

  constructor() {
    // Automatically seed initial state directly from backend microservices
    if (typeof window !== 'undefined') {
      this.fetchWorkouts().subscribe();
      this.fetchWorkoutPlans().subscribe();
    }
  }

  // Active workout session runner state
  private activeSessionSignal = signal<{
    workout: WorkoutDetails;
    sessionId: string;
    startedAt: Date;
    currentExerciseIndex: number;
    currentSet: number;
    isPaused: boolean;
    elapsedSeconds: number;
  } | null>(null);

  readonly activeSession = this.activeSessionSignal.asReadonly();

  fetchWorkouts(filterParams?: {
    category?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    pageSize?: number
  }): Observable<Workout[]> {
    let params = new HttpParams()
      .set('page', (filterParams?.page ?? 1).toString())
      .set('pageSize', (filterParams?.pageSize ?? 20).toString());

    if (filterParams?.search?.trim())
      params = params.set('search', filterParams.search.trim());

    if (filterParams?.category && filterParams.category !== 'all')
      params = params.set('category', filterParams.category);

    if (filterParams?.difficulty && filterParams.difficulty !== 'all')
      params = params.set('difficulty', filterParams.difficulty);

    return this.http.get<ApiResponse<BackendWorkoutViewModel[]>>(
      `${this.apiUrl}/workouts`, { params }
    ).pipe(
      map(res => {
        if (!res.isSuccess || !res.data || res.data.length === 0) {
          return this.getWorkouts(filterParams);
        }
        const mapped: WorkoutDetails[] = res.data.map(item => {
          const catKey = item.category.toLowerCase();
          const existing = this.workoutsSignal().find(w => w.workoutId === item.workoutId);
          return {
            workoutId: item.workoutId,
            name: item.name,
            planId: item.planId,
            category: item.category,
            difficulty: item.difficulty,
            durationInMinutes: item.durationInMinutes,
            caloriesBurn: Math.round(item.durationInMinutes * 8.5),
            description: existing?.description || `${item.name} routine focused on ${item.category} training.`,
            imageUrl: existing?.imageUrl || this.categoryImages[catKey] || this.categoryImages['fullbody'],
            exercisesCount: existing?.exercises.length || 4,
            exercises: existing?.exercises || []
          };
        });

        // Merge backend results while keeping details cache
        this.workoutsSignal.update(current => {
          const merged = [...current];
          for (const m of mapped) {
            const idx = merged.findIndex(w => w.workoutId === m.workoutId);
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...m };
            } else {
              merged.push(m);
            }
          }
          return merged;
        });
        return mapped;
      }),
      catchError(() => of(this.getWorkouts(filterParams)))
    );
  }

  fetchWorkoutById(id: number): Observable<WorkoutDetails> {
    return this.http.get<ApiResponse<BackendWorkoutDetailsViewModel>>(`${this.apiUrl}/workouts/${id}`).pipe(
      map(res => {
        const d = res.data;
        if (!d) throw new Error('Workout not found');
        const catKey = (d.workoutCategory || '').toLowerCase();
        const existing = this.workoutsSignal().find(w => w.workoutId === d.workoutId);
        const exercises: Exercise[] = (d.exercises || []).map(e => ({
          exerciseId: e.exerciseId,
          name: e.exerciseName,
          targetMuscles: e.targetMuscles,
          equipment: e.exerciseEquipment,
          difficulty: e.exerciseDifficulty,
          description: e.exerciseDescription,
          videoUrl: e.exerciseVideoUrl,
          setsDefault: e.setsDefault,
          repsDefault: e.repsDefault,
          restTimeInSeconds: e.restTimeInSeconds,
          orderIndex: e.orderIndex
        }));

        const details: WorkoutDetails = {
          workoutId: d.workoutId,
          name: d.workoutName,
          planId: d.planId,
          category: d.workoutCategory,
          difficulty: d.workoutDifficulty,
          durationInMinutes: d.durationInMinutes,
          caloriesBurn: Math.round(d.durationInMinutes * 8.5),
          description: existing?.description || `${d.workoutName} routine targeting ${d.workoutCategory}.`,
          imageUrl: existing?.imageUrl || this.categoryImages[catKey] || this.categoryImages['fullbody'],
          exercisesCount: exercises.length,
          exercises
        };
        this.workoutsSignal.update(list => {
          const idx = list.findIndex(w => w.workoutId === details.workoutId);
          if (idx >= 0) {
            list[idx] = details;
            return [...list];
          }
          return [...list, details];
        });
        return details;
      }),
      catchError(() => {
        const fallback = this.getWorkoutById(id) || this.workoutsSignal()[0];
        return of(fallback);
      })
    );
  }

  fetchWorkoutPlans(): Observable<WorkoutPlan[]> {
    return this.http.get<ApiResponse<BackendWorkoutPlanViewModel[]>>(`${this.apiUrl}/workout-plans`).pipe(
      map(res => {
        if (!res.isSuccess || !res.data || res.data.length === 0) {
          return this.workoutPlansSignal();
        }
        const plans: WorkoutPlan[] = res.data.map(p => ({
          planId: p.planId,
          name: p.name,
          description: p.description || 'Structured progressive training program.',
          goal: p.goal || 'General Fitness',
          status: p.status || 'Available',
          difficulty: p.difficulty || 'Intermediate',
          workoutsCount: 16,
          durationWeeks: 4
        }));
        this.workoutPlansSignal.set(plans);
        return plans;
      }),
      catchError(() => of(this.workoutPlansSignal()))
    );
  }

  getWorkouts(params?: { category?: string; difficulty?: string; search?: string }): Workout[] {
    let list = this.workoutsSignal();
    if (params?.category && params.category !== 'all') {
      list = list.filter(w => w.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.difficulty && params.difficulty !== 'all') {
      list = list.filter(w => w.difficulty.toLowerCase() === params.difficulty!.toLowerCase());
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(w => w.name.toLowerCase().includes(q) || (w.description || '').toLowerCase().includes(q));
    }
    return list;
  }

  getWorkoutById(id: number): WorkoutDetails | undefined {
    return this.workoutsSignal().find(w => w.workoutId === id);
  }

  startSession(workoutId: number, difficulty?: string, plannedDuration?: number): Observable<StartWorkoutSessionResponse> {
    const workout = this.getWorkoutById(workoutId) || this.workoutsSignal()[0];
    const diff = difficulty || workout.difficulty || 'beginner';
    const duration = plannedDuration || workout.durationInMinutes || 30;
    let params = new HttpParams()
      .set('Difficulty', diff)
      .set('PlannedDuration', duration.toString());
    return this.http.post<ApiResponse<BackendStartSessionResponse>>(`${this.apiUrl}/workouts/${workoutId}/start`, {}, { params }).pipe(
      map(res => {
        const d = res.data;
        const sessionId = d?.sessionId || 'sess_' + Date.now().toString().slice(-6);
        const exercisesInSession: Exercise[] = (d?.exercisesInSession && d.exercisesInSession.length > 0)
          ? d.exercisesInSession.map(e => ({
            exerciseId: e.exerciseId,
            name: e.name,
            targetMuscles: e.targetMuscles,
            equipment: e.equipment,
            difficulty: e.difficulty,
            description: e.description,
            videoUrl: e.videoUrl,
            setsDefault: e.setsDefault,
            repsDefault: e.repsDefault,
            restTimeInSeconds: e.restTimeInSeconds,
            orderIndex: e.orderIndex
          }))
          : workout.exercises;
        this.activeSessionSignal.set({
          workout: { ...workout, exercises: exercisesInSession },
          sessionId,
          startedAt: new Date(),
          currentExerciseIndex: 0,
          currentSet: 1,
          isPaused: false,
          elapsedSeconds: 0
        });
        return {
          sessionId,
          status: d?.status || 'InProgress',
          exercisesInSession
        };
      }),
      catchError(() => {
        // Graceful offline fallback
        const localSessionId = 'sess_' + Date.now().toString().slice(-6);
        this.activeSessionSignal.set({
          workout,
          sessionId: localSessionId,
          startedAt: new Date(),
          currentExerciseIndex: 0,
          currentSet: 1,
          isPaused: false,
          elapsedSeconds: 0
        });
        return of({
          sessionId: localSessionId,
          status: 'InProgress',
          exercisesInSession: workout.exercises
        });
      })
    );
  }

  updateSessionProgress(exerciseIndex: number, set: number): void {
    const s = this.activeSessionSignal();
    if (!s) return;
    this.activeSessionSignal.set({
      ...s,
      currentExerciseIndex: exerciseIndex,
      currentSet: set
    });
  }

  setSessionPaused(isPaused: boolean): void {
    const s = this.activeSessionSignal();
    if (!s) return;
    this.activeSessionSignal.set({ ...s, isPaused });
  }

  tickSessionSecond(): void {
    const s = this.activeSessionSignal();
    if (!s || s.isPaused) return;
    this.activeSessionSignal.set({
      ...s,
      elapsedSeconds: s.elapsedSeconds + 1
    });
  }

  finishSession(): WorkoutCompletionRequest | null {
    const s = this.activeSessionSignal();
    if (!s) return null;

    const durationMinutes = Math.max(1, Math.round(s.elapsedSeconds / 60));
    const completion: WorkoutCompletionRequest = {
      workoutId: s.workout.workoutId,
      sessionId: s.sessionId,
      durationInMinutes: durationMinutes,
      caloriesBurned: Math.round(durationMinutes * 9.2),
      exercisesCompleted: s.workout.exercises.length,
      rating: 5,
      notes: 'Great workout session finished!'
    };

    this.activeSessionSignal.set(null);
    return completion;
  }

  cancelSession(): void {
    this.activeSessionSignal.set(null);
  }
}
