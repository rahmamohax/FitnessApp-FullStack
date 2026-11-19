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
  template: `
    @if (workout(); as w) {
      <div class="space-y-6 pb-8 animate-fade-in">
        <!-- Back Navigation & Action Bar -->
        <div class="flex items-center justify-between">
          <a
            routerLink="/app/workouts"
            class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <app-icon name="arrow-left" size="16"/>
            <span>Back to Workouts</span>
          </a>

          <button
            type="button"
            (click)="toggleFavorite()"
            class="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-[#FF5722] transition-colors"
            [class.text-[#FF5722]]="isFavorite()"
            aria-label="Save to favorites"
          >
            <app-icon name="heart" size="18"/>
          </button>
        </div>

        <!-- Hero Workout Banner (Figma workout header) -->
        <section class="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <img
            [src]="w.imageUrl"
            [alt]="w.name"
            class="w-full h-64 sm:h-80 object-cover object-center"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-[#0D0D12]/70 to-transparent"></div>

          <div class="absolute inset-0 p-6 flex flex-col justify-end">
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2.5 py-1 rounded-full bg-[#FF5722] text-white text-[10px] font-bold uppercase tracking-wider">
                {{ w.category }}
              </span>
              <span class="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-slate-300 border border-white/10 capitalize">
                {{ w.difficulty }}
              </span>
            </div>

            <h1 class="text-2xl sm:text-3xl font-black uppercase text-white mb-2">
              {{ w.name }}
            </h1>
            <p class="text-xs text-slate-300 max-w-xl leading-relaxed mb-4">
              {{ w.description }}
            </p>

            <!-- Quick Specs Row -->
            <div class="flex flex-wrap items-center gap-4 text-xs text-slate-300 mb-6">
              <span class="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                <app-icon name="clock" size="14" cssClass="text-[#FF5722]"/>
                {{ w.durationInMinutes }} Minutes
              </span>
              <span class="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                <app-icon name="flame" size="14" cssClass="text-[#FF5722]"/>
                {{ w.caloriesBurn }} Estimated Kcal
              </span>
              <span class="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                <app-icon name="dumbbell" size="14" cssClass="text-[#FF5722]"/>
                {{ w.exercises.length }} Exercises
              </span>
            </div>

            <!-- Start Workout Button Trigger -->
            <button
              type="button"
              (click)="startSession()"
              class="w-full sm:w-auto self-start px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white font-bold text-sm uppercase tracking-wider hover:opacity-95 shadow-xl shadow-[#FF5722]/40 glow-orange flex items-center justify-center gap-2 transition-all"
            >
              <app-icon name="play" size="16"/>
              <span>Start Workout Session</span>
            </button>
          </div>
        </section>

        <!-- Exercise Breakdown List (Figma Exercise sequence) -->
        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-black uppercase tracking-wider text-white">Exercise Sequence</h2>
              <p class="text-xs text-slate-400">Perform sets in listed order with prescribed rest intervals</p>
            </div>
            <span class="text-xs text-slate-500 font-semibold">{{ w.exercises.length }} Movements</span>
          </div>

          <div class="space-y-3">
            @for (ex of w.exercises; track ex.exerciseId; let idx = $index) {
              <div class="p-4 rounded-3xl bg-[#161622] border border-white/5 hover:border-white/10 transition-colors shadow-lg">
                <div class="flex items-start gap-4">
                  <!-- Exercise Number Badge -->
                  <div class="w-10 h-10 rounded-2xl bg-[#FF5722]/15 text-[#FF5722] font-black text-sm flex items-center justify-center shrink-0">
                    0{{ idx + 1 }}
                  </div>

                  <!-- Details -->
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <h3 class="text-base font-bold text-white">{{ ex.name }}</h3>
                      <div class="flex items-center gap-2 text-xs text-[#FF5722] font-semibold">
                        <span>{{ ex.setsDefault }} Sets</span>
                        <span>•</span>
                        <span>{{ ex.repsDefault }} Reps</span>
                        <span>•</span>
                        <span>{{ ex.restTimeInSeconds }}s Rest</span>
                      </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mb-2">
                      <span class="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-slate-300">
                        Target: {{ ex.targetMuscles }}
                      </span>
                      <span class="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-slate-300">
                        Equipment: {{ ex.equipment }}
                      </span>
                    </div>

                    <p class="text-xs text-slate-400 leading-relaxed">
                      {{ ex.description }}
                    </p>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Active Workout Session Live Companion Overlay -->
        @if (isSessionActive()) {
          <div class="fixed inset-0 z-50 bg-[#0D0D12]/95 backdrop-blur-xl flex flex-col justify-between p-6 animate-fade-in">
            <!-- Active Header -->
            <div class="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#FF5722]">Live Workout Session</span>
                <h3 class="text-lg font-bold text-white">{{ w.name }}</h3>
              </div>

              <!-- Stop / Exit Session -->
              <button
                type="button"
                (click)="cancelSession()"
                class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-300 font-semibold transition-colors"
              >
                Quit Session
              </button>
            </div>

            <!-- Active Exercise Card -->
            <div class="my-auto max-w-md mx-auto w-full text-center">
              <!-- Session Timer Display -->
              <div class="mb-6">
                <span class="text-xs text-slate-400 uppercase tracking-widest block mb-1">Elapsed Time</span>
                <div class="text-5xl font-black text-white tracking-wider font-mono">
                  {{ formatTimer(sessionSeconds()) }}
                </div>
              </div>

              @if (currentExercise(); as activeEx) {
                <div class="p-6 rounded-3xl bg-[#161622] border border-white/10 shadow-2xl mb-6">
                  <span class="text-xs font-bold text-[#FF5722] uppercase tracking-wider block mb-1">
                    Exercise {{ currentExerciseIndex() + 1 }} of {{ w.exercises.length }}
                  </span>
                  <h2 class="text-2xl font-black text-white mb-2">{{ activeEx.name }}</h2>
                  <p class="text-xs text-slate-400 mb-6">{{ activeEx.targetMuscles }}</p>

                  <!-- Set & Reps Tracker -->
                  <div class="flex items-center justify-center gap-6 mb-6">
                    <div class="text-center">
                      <span class="text-[11px] text-slate-400 uppercase font-semibold block">Current Set</span>
                      <span class="text-3xl font-extrabold text-white">{{ currentSet() }} / {{ activeEx.setsDefault }}</span>
                    </div>
                    <div class="w-px h-10 bg-white/10"></div>
                    <div class="text-center">
                      <span class="text-[11px] text-slate-400 uppercase font-semibold block">Target Reps</span>
                      <span class="text-3xl font-extrabold text-[#FF5722]">{{ activeEx.repsDefault }}</span>
                    </div>
                  </div>

                  <!-- Rest Timer Display (if resting) -->
                  @if (isResting()) {
                    <div class="p-4 rounded-2xl bg-[#FF5722]/10 border border-[#FF5722]/30 text-center mb-4">
                      <span class="text-xs font-bold text-[#FF5722] uppercase tracking-wider block mb-1">Rest Interval</span>
                      <div class="text-3xl font-black text-white font-mono">{{ restSecondsLeft() }}s</div>
                      <button
                        type="button"
                        (click)="addRestTime(15)"
                        class="text-xs text-[#FF5722] hover:underline mt-1 font-semibold"
                      >
                        +15s Rest
                      </button>
                    </div>
                  }

                  <!-- Instructions Reminder -->
                  <p class="text-xs text-slate-400 italic">
                    "{{ activeEx.description }}"
                  </p>
                </div>
              }

              <!-- Controls -->
              <div class="space-y-3">
                <button
                  type="button"
                  (click)="completeSet()"
                  class="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white font-bold text-base hover:opacity-95 active:scale-[0.99] transition-all shadow-xl shadow-[#FF5722]/30 flex items-center justify-center gap-2"
                >
                  <app-icon name="check" size="20"/>
                  <span>{{ isResting() ? 'Skip Rest & Next Set' : 'Complete Set' }}</span>
                </button>

                <button
                  type="button"
                  (click)="finishEarly()"
                  class="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Finish Entire Workout Now
                </button>
              </div>
            </div>

            <!-- Footer Next Preview -->
            <div class="text-center text-xs text-slate-500 pt-2">
              Super Fitness Live Session Tracker
            </div>
          </div>
        }

        <!-- Workout Completed Celebration Modal -->
        @if (showCelebrationModal()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div class="w-full max-w-sm rounded-3xl bg-[#161622] border border-[#FF5722]/30 p-6 text-center shadow-2xl">
              <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center text-4xl glow-orange">
                🏆
              </div>

              <span class="text-xs font-bold text-[#FF5722] uppercase tracking-widest block mb-1">Workout Complete</span>
              <h3 class="text-2xl font-black text-white mb-2">Incredible Work!</h3>
              <p class="text-xs text-slate-400 mb-6 leading-relaxed">
                You successfully crushed <span class="text-white font-semibold">{{ w.name }}</span>! Your stats and streak have been updated.
              </p>

              <div class="grid grid-cols-2 gap-3 mb-6 p-4 rounded-2xl bg-white/5 text-center">
                <div>
                  <span class="text-[11px] text-slate-400 block">Duration</span>
                  <span class="text-xl font-black text-white">{{ completedDurationMinutes() }} mins</span>
                </div>
                <div>
                  <span class="text-[11px] text-slate-400 block">Calories Burned</span>
                  <span class="text-xl font-black text-[#FF5722]">{{ completedCalories() }} kcal</span>
                </div>
              </div>

              <button
                type="button"
                (click)="dismissCelebration()"
                class="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white font-bold text-sm uppercase tracking-wider hover:opacity-95 shadow-xl shadow-[#FF5722]/30 transition-all"
              >
                Back To Dashboard
              </button>
            </div>
          </div>
        }
      </div>
    }
  `
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
    const found = this.workoutService.getWorkoutById(workoutId) || this.workoutService.workouts()[0];
    this.workout.set(found);
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

    this.workoutService.startSession(w.workoutId);
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
