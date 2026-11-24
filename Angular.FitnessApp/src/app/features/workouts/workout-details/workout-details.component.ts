import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WorkoutService } from '../../../core/services/workout.service';
import { ProgressService } from '../../../core/services/progress.service';
import { ToastService } from '../../../core/services/toast.service';
import { WorkoutDetails, Exercise } from '../../../core/models/workout.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-workout-details',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workout-details.html'
})
export class WorkoutDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workoutService = inject(WorkoutService);
  private progressService = inject(ProgressService);
  private toastService = inject(ToastService);

  workout = signal<WorkoutDetails | null>(null);
  isFavorite = signal<boolean>(false);

  // Active workout runner state
  isSessionActive = signal<boolean>(false);
  sessionSeconds = signal<number>(0);
  currentExerciseIndex = signal<number>(0);
  currentSet = signal<number>(1);
  isResting = signal<boolean>(false);
  restSecondsLeft = signal<number>(0);

  // Celebration modal
  showCelebrationModal = signal<boolean>(false);
  completedDurationMinutes = signal<number>(0);
  completedCalories = signal<number>(0);

  private timerInterval: any;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const workoutId = idParam ? parseInt(idParam, 10) : 1;
    
    const cached = this.workoutService.getWorkoutById(workoutId);
    if(cached) this.workout.set(cached);

    this.workoutService.fetchWorkoutById(workoutId).subscribe({
      next: (details) => this.workout.set(details)
    })
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  currentExercise(): Exercise | null {
    const w = this.workout();
    if (!w) return null;
    return w.exercises[this.currentExerciseIndex()] || null;
  }

  toggleFavorite(): void {
    this.isFavorite.update(v => !v);
    this.toastService.info(this.isFavorite() ? 'Added to favorites' : 'Removed from favorites');
  }

  startSession(): void {
    const w = this.workout();
    if (!w) return;

    this.workoutService.startSession(w.workoutId, 
      w.difficulty as string,
      w.durationInMinutes
     ).subscribe({
      next: (sessionRes) => {
        this.isSessionActive.set(true);
        this.sessionSeconds.set(0);
        this.currentExerciseIndex.set(0);
        this.currentSet.set(1);
        this.isResting.set(false);

        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
          this.sessionSeconds.update(s => s + 1);
          if (this.isResting() && this.restSecondsLeft() > 0) {
            this.restSecondsLeft.update(r => r - 1);
            if (this.restSecondsLeft() === 0) {
              this.isResting.set(false);
              this.toastService.info('Rest finished! Time for next set.', 'Ready');
            }
          }
        }, 1000);

        this.toastService.success(`Session started! Let's get moving!`, 'Workout In Progress');
      }
     });
  }

  completeSet(): void {
    const ex = this.currentExercise();
    if (!ex) return;

    if (this.isResting()) {
      this.isResting.set(false);
    }

    if (this.currentSet() < ex.setsDefault) {
      this.currentSet.update(s => s + 1);
      this.isResting.set(true);
      this.restSecondsLeft.set(ex.restTimeInSeconds);
    } else {
      // Completed all sets for this exercise, advance to next exercise
      const w = this.workout()!;
      if (this.currentExerciseIndex() < w.exercises.length - 1) {
        this.currentExerciseIndex.update(i => i + 1);
        this.currentSet.set(1);
        this.isResting.set(true);
        this.restSecondsLeft.set(60);
        this.toastService.success(`Great job on ${ex.name}! Up next: ${w.exercises[this.currentExerciseIndex()].name}`);
      } else {
        // Finished all exercises
        this.finishEarly();
      }
    }
  }

  addRestTime(seconds: number): void {
    this.restSecondsLeft.update(r => r + seconds);
  }

  finishEarly(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);

    const w = this.workout()!;
    const durMins = Math.max(1, Math.round(this.sessionSeconds() / 60));
    const calories = Math.round(durMins * 8.5) + 120;

    this.completedDurationMinutes.set(durMins);
    this.completedCalories.set(calories);

    this.progressService.logWorkoutCompletion(
      {
        workoutId: w.workoutId,
        durationInMinutes: durMins,
        caloriesBurned: calories,
        exercisesCompleted: this.currentExerciseIndex() + 1
      },
      w.name
    );

    this.isSessionActive.set(false);
    this.workoutService.cancelSession();
    this.showCelebrationModal.set(true);
  }

  cancelSession(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.isSessionActive.set(false);
    this.workoutService.cancelSession();
    this.toastService.warning('Workout session canceled.');
  }

  dismissCelebration(): void {
    this.showCelebrationModal.set(false);
    this.router.navigate(['/app/home']);
  }

  formatTimer(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
