import { Injectable, signal, computed } from '@angular/core';
import { Exercise, StartWorkoutSessionResponse, Workout, WorkoutCategory, WorkoutCompletionRequest, WorkoutDetails, WorkoutDifficulty, WorkoutPlan } from '../models/workout.models';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private workoutsSignal = signal<WorkoutDetails[]>([
    {
      workoutId: 1,
      name: 'Chest Hypertrophy & Power',
      category: WorkoutCategory.Chest,
      durationInMinutes: 45,
      difficulty: WorkoutDifficulty.Intermediate,
      caloriesBurn: 380,
      imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
      exercisesCount: 5,
      description: 'A high-intensity chest-focused routine targeting upper, middle, and lower pectorals with optimal rest-pause sets.',
      exercises: [
        {
          exerciseId: 101,
          name: 'Flat Barbell Bench Press',
          targetMuscles: 'Pectoralis Major, Anterior Deltoids, Triceps',
          equipment: 'Barbell & Bench',
          difficulty: 'Intermediate',
          description: 'Lie back on a flat bench. Grip the barbell with hands slightly wider than shoulder-width. Lower the bar smoothly to your mid-chest, then drive powerfully upward.',
          setsDefault: 4,
          repsDefault: 10,
          restTimeInSeconds: 90,
          orderIndex: 1
        },
        {
          exerciseId: 102,
          name: 'Incline Dumbbell Press',
          targetMuscles: 'Clavicular Head (Upper Chest)',
          equipment: 'Dumbbells & Incline Bench',
          difficulty: 'Intermediate',
          description: 'Set bench to 30-45 degrees. Press dumbbells up over your upper chest, squeezing at the top without locking out the elbows.',
          setsDefault: 3,
          repsDefault: 12,
          restTimeInSeconds: 60,
          orderIndex: 2
        },
        {
          exerciseId: 103,
          name: 'Cable Chest Flyes',
          targetMuscles: 'Sternal Head, Inner Chest',
          equipment: 'Cable Machine',
          difficulty: 'Beginner',
          description: 'Bring pulleys forward in an arc motion like hugging a large tree. Keep a slight bend in your elbows and maintain a steady contraction.',
          setsDefault: 3,
          repsDefault: 15,
          restTimeInSeconds: 60,
          orderIndex: 3
        },
        {
          exerciseId: 104,
          name: 'Parallel Bar Dips',
          targetMuscles: 'Lower Chest, Triceps',
          equipment: 'Dip Bars',
          difficulty: 'Advanced',
          description: 'Lean your torso slightly forward to focus stress onto the chest. Lower until elbows reach 90 degrees, then press back up.',
          setsDefault: 3,
          repsDefault: 12,
          restTimeInSeconds: 75,
          orderIndex: 4
        },
        {
          exerciseId: 105,
          name: 'Push-Ups Finisher',
          targetMuscles: 'Full Chest, Core',
          equipment: 'Bodyweight',
          difficulty: 'Beginner',
          description: 'Standard push-ups performed to muscular fatigue. Maintain rigid core and neutral neck.',
          setsDefault: 2,
          repsDefault: 20,
          restTimeInSeconds: 45,
          orderIndex: 5
        }
      ]
    },
    {
      workoutId: 2,
      name: 'Full Body Metabolic Blast',
      category: WorkoutCategory.FullBody,
      durationInMinutes: 40,
      difficulty: WorkoutDifficulty.Beginner,
      caloriesBurn: 420,
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      exercisesCount: 4,
      description: 'Dynamic compound movements designed to stimulate full-body athletic conditioning and calorie burn.',
      exercises: [
        {
          exerciseId: 201,
          name: 'Goblet Squats',
          targetMuscles: 'Quadriceps, Glutes, Core',
          equipment: 'Kettlebell or Dumbbell',
          difficulty: 'Beginner',
          description: 'Hold weight at chest level. Squat deep keeping knees tracking in line with toes, chest upright.',
          setsDefault: 3,
          repsDefault: 12,
          restTimeInSeconds: 60,
          orderIndex: 1
        },
        {
          exerciseId: 202,
          name: 'Dumbbell Renegade Rows',
          targetMuscles: 'Latissimus Dorsi, Rhomboids, Core',
          equipment: 'Pair of Dumbbells',
          difficulty: 'Intermediate',
          description: 'In a high plank position with hands on dumbbells, alternate rowing one dumbbell up to hip without twisting hips.',
          setsDefault: 3,
          repsDefault: 10,
          restTimeInSeconds: 60,
          orderIndex: 2
        },
        {
          exerciseId: 203,
          name: 'Kettlebell Swings',
          targetMuscles: 'Hamstrings, Glutes, Lower Back',
          equipment: 'Kettlebell',
          difficulty: 'Intermediate',
          description: 'Hinge at the hips, keeping back flat. Explode hips forward to propel kettlebell to eye level.',
          setsDefault: 4,
          repsDefault: 15,
          restTimeInSeconds: 45,
          orderIndex: 3
        },
        {
          exerciseId: 204,
          name: 'Mountain Climbers',
          targetMuscles: 'Core, Cardiovascular',
          equipment: 'Bodyweight',
          difficulty: 'Beginner',
          description: 'Drive knees toward chest alternately in rapid, controlled cadence.',
          setsDefault: 3,
          repsDefault: 30,
          restTimeInSeconds: 45,
          orderIndex: 4
        }
      ]
    },
    {
      workoutId: 3,
      name: 'V-Taper Back & Biceps',
      category: WorkoutCategory.Back,
      durationInMinutes: 50,
      difficulty: WorkoutDifficulty.Intermediate,
      caloriesBurn: 410,
      imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',
      exercisesCount: 5,
      description: 'Develop back width and thickness combined with peak bicep recruitment.',
      exercises: [
        {
          exerciseId: 301,
          name: 'Lat Pulldowns (Wide Grip)',
          targetMuscles: 'Latissimus Dorsi, Teres Major',
          equipment: 'Cable Machine',
          difficulty: 'Beginner',
          description: 'Pull bar down toward upper collarbone, driving elbows down and back.',
          setsDefault: 4,
          repsDefault: 10,
          restTimeInSeconds: 60,
          orderIndex: 1
        },
        {
          exerciseId: 302,
          name: 'Bent-Over Barbell Rows',
          targetMuscles: 'Mid Back, Rhomboids, Lats',
          equipment: 'Barbell',
          difficulty: 'Intermediate',
          description: 'Hinge hips at 45 degrees. Pull barbell smoothly to upper abdomen.',
          setsDefault: 4,
          repsDefault: 8,
          restTimeInSeconds: 75,
          orderIndex: 2
        },
        {
          exerciseId: 303,
          name: 'Seated Cable Rows',
          targetMuscles: 'Middle Traps, Rhomboids',
          equipment: 'Cable Row Machine',
          difficulty: 'Beginner',
          description: 'Sit upright, pull handle to belly button, squeeze shoulder blades together.',
          setsDefault: 3,
          repsDefault: 12,
          restTimeInSeconds: 60,
          orderIndex: 3
        },
        {
          exerciseId: 304,
          name: 'Incline Dumbbell Bicep Curls',
          targetMuscles: 'Biceps Brachii (Long Head)',
          equipment: 'Dumbbells & Incline Bench',
          difficulty: 'Intermediate',
          description: 'Full stretch at bottom, curl dumbbells up supinating wrists.',
          setsDefault: 3,
          repsDefault: 12,
          restTimeInSeconds: 60,
          orderIndex: 4
        },
        {
          exerciseId: 305,
          name: 'Hammer Curls',
          targetMuscles: 'Brachialis, Forearms',
          equipment: 'Dumbbells',
          difficulty: 'Beginner',
          description: 'Neutral palms facing each other, curl up with strict elbow position.',
          setsDefault: 3,
          repsDefault: 12,
          restTimeInSeconds: 45,
          orderIndex: 5
        }
      ]
    },
    {
      workoutId: 4,
      name: 'Lower Body Strength & Glutes',
      category: WorkoutCategory.Legs,
      durationInMinutes: 55,
      difficulty: WorkoutDifficulty.Advanced,
      caloriesBurn: 520,
      imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
      exercisesCount: 5,
      description: 'Heavy compound leg routine built for quad strength, hamstring development, and glute activation.',
      exercises: [
        {
          exerciseId: 401,
          name: 'Barbell Back Squat',
          targetMuscles: 'Quadriceps, Glutes, Core',
          equipment: 'Barbell & Squat Rack',
          difficulty: 'Advanced',
          description: 'Rest bar on upper traps. Break at hips and knees simultaneously to hit parallel, then drive up through mid-foot.',
          setsDefault: 4,
          repsDefault: 8,
          restTimeInSeconds: 120,
          orderIndex: 1
        },
        {
          exerciseId: 402,
          name: 'Romanian Deadlifts (RDL)',
          targetMuscles: 'Hamstrings, Posterior Chain',
          equipment: 'Barbell',
          difficulty: 'Intermediate',
          description: 'Keep slight bend in knees, push hips back, feel intense hamstring stretch before driving hips forward.',
          setsDefault: 3,
          repsDefault: 10,
          restTimeInSeconds: 90,
          orderIndex: 2
        },
        {
          exerciseId: 403,
          name: 'Walking Dumbbell Lunges',
          targetMuscles: 'Glutes, Quads, Calves',
          equipment: 'Dumbbells',
          difficulty: 'Intermediate',
          description: 'Step forward keeping front knee aligned. Lower back knee toward floor, alternating legs.',
          setsDefault: 3,
          repsDefault: 20,
          restTimeInSeconds: 60,
          orderIndex: 3
        },
        {
          exerciseId: 404,
          name: 'Leg Press',
          targetMuscles: 'Quads',
          equipment: 'Leg Press Machine',
          difficulty: 'Beginner',
          description: 'Feet shoulder-width on platform. Lower sled with control without lifting tailbone off seat.',
          setsDefault: 3,
          repsDefault: 12,
          restTimeInSeconds: 75,
          orderIndex: 4
        },
        {
          exerciseId: 405,
          name: 'Standing Calf Raises',
          targetMuscles: 'Gastrocnemius, Soleus',
          equipment: 'Calf Machine or Step',
          difficulty: 'Beginner',
          description: 'Full ankle extension at top with 1-second pause, deep stretch at bottom.',
          setsDefault: 4,
          repsDefault: 15,
          restTimeInSeconds: 45,
          orderIndex: 5
        }
      ]
    },
    {
      workoutId: 5,
      name: 'Boulder Shoulders & Core',
      category: WorkoutCategory.Shoulders,
      durationInMinutes: 45,
      difficulty: WorkoutDifficulty.Intermediate,
      caloriesBurn: 360,
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      exercisesCount: 4,
      description: 'Complete 3D shoulder sculpting focusing on anterior, lateral, and posterior deltoids with ab finishing circuit.',
      exercises: [
        {
          exerciseId: 501,
          name: 'Seated Overhead Dumbbell Press',
          targetMuscles: 'Anterior & Medial Deltoids',
          equipment: 'Dumbbells & Bench',
          difficulty: 'Intermediate',
          description: 'Press dumbbells vertically above head with smooth eccentric control.',
          setsDefault: 4,
          repsDefault: 10,
          restTimeInSeconds: 75,
          orderIndex: 1
        },
        {
          exerciseId: 502,
          name: 'Dumbbell Lateral Raises',
          targetMuscles: 'Lateral Deltoids (Side Delts)',
          equipment: 'Dumbbells',
          difficulty: 'Beginner',
          description: 'Raise arms out to sides with slight forward angle, leading with elbows to shoulder level.',
          setsDefault: 4,
          repsDefault: 15,
          restTimeInSeconds: 45,
          orderIndex: 2
        },
        {
          exerciseId: 503,
          name: 'Face Pulls with Rope',
          targetMuscles: 'Rear Delts, Rotator Cuff',
          equipment: 'Cable Machine',
          difficulty: 'Beginner',
          description: 'Pull rope toward eye level, pulling hands apart and externally rotating shoulders.',
          setsDefault: 3,
          repsDefault: 15,
          restTimeInSeconds: 45,
          orderIndex: 3
        },
        {
          exerciseId: 504,
          name: 'Hanging Leg Raises',
          targetMuscles: 'Rectus Abdominis, Hip Flexors',
          equipment: 'Pull-up Bar',
          difficulty: 'Advanced',
          description: 'Hang from bar with straight arms. Raise legs up to 90 degrees without swinging.',
          setsDefault: 3,
          repsDefault: 12,
          restTimeInSeconds: 45,
          orderIndex: 4
        }
      ]
    },
    {
      workoutId: 6,
      name: 'Six-Pack Shred & Core Matrix',
      category: WorkoutCategory.Stomach,
      durationInMinutes: 30,
      difficulty: WorkoutDifficulty.Beginner,
      caloriesBurn: 250,
      imageUrl: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=800&q=80',
      exercisesCount: 4,
      description: 'High-density abdominal strengthening focusing on anti-extension, rotational stability, and lower ab compression.',
      exercises: [
        {
          exerciseId: 601,
          name: 'Abdominal Plank Hold',
          targetMuscles: 'Transverse Abdominis, Obliques',
          equipment: 'Mat',
          difficulty: 'Beginner',
          description: 'Maintain flat spine on forearms and toes. Squeeze glutes and brace core tightly.',
          setsDefault: 3,
          repsDefault: 60, // seconds
          restTimeInSeconds: 45,
          orderIndex: 1
        },
        {
          exerciseId: 602,
          name: 'Bicycle Crunches',
          targetMuscles: 'Internal & External Obliques',
          equipment: 'Mat',
          difficulty: 'Beginner',
          description: 'Alternate touching opposite elbow to opposite knee with controlled rotation.',
          setsDefault: 3,
          repsDefault: 20,
          restTimeInSeconds: 30,
          orderIndex: 2
        },
        {
          exerciseId: 603,
          name: 'Cable Woodchoppers',
          targetMuscles: 'Rotational Core, Obliques',
          equipment: 'Cable Machine',
          difficulty: 'Intermediate',
          description: 'Rotate torso diagonally across body in powerful athletic motion.',
          setsDefault: 3,
          repsDefault: 12,
          restTimeInSeconds: 45,
          orderIndex: 3
        },
        {
          exerciseId: 604,
          name: 'Dead Bug Stability',
          targetMuscles: 'Deep Core Stabilizers',
          equipment: 'Mat',
          difficulty: 'Beginner',
          description: 'Extend opposite arm and leg while pressing lower back firmly into the floor.',
          setsDefault: 3,
          repsDefault: 12,
          restTimeInSeconds: 30,
          orderIndex: 4
        }
      ]
    }
  ]);

  private workoutPlansSignal = signal<WorkoutPlan[]>([
    {
      planId: 'plan_hypertrophy_4w',
      name: '4-Week Hypertrophy Transformation',
      description: 'Structured 4-day split aimed at maximizing lean muscle mass and structural strength.',
      goal: 'Build Muscle',
      difficulty: 'Intermediate',
      workoutsCount: 16,
      durationWeeks: 4
    },
    {
      planId: 'plan_fat_loss_6w',
      name: '6-Week Shred & Conditioning',
      description: 'High-tempo circuit and resistance training to accelerate fat burning while preserving lean tissue.',
      goal: 'Lose Weight',
      difficulty: 'Beginner',
      workoutsCount: 24,
      durationWeeks: 6
    },
    {
      planId: 'plan_strength_8w',
      name: '8-Week Powerbuilding Foundation',
      description: 'Combination of classic powerlifting compound lifts and bodybuilding hypertrophy work.',
      goal: 'Get Fitter',
      difficulty: 'Advanced',
      workoutsCount: 32,
      durationWeeks: 8
    }
  ]);

  readonly workouts = this.workoutsSignal.asReadonly();
  readonly workoutPlans = this.workoutPlansSignal.asReadonly();

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
      list = list.filter(w => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q));
    }
    return list;
  }

  getWorkoutById(id: number): WorkoutDetails | undefined {
    return this.workoutsSignal().find(w => w.workoutId === id);
  }

  startSession(workoutId: number): StartWorkoutSessionResponse {
    const workout = this.getWorkoutById(workoutId);
    if (!workout) {
      throw new Error('Workout not found');
    }

    const sessionId = 'sess_' + Date.now().toString().slice(-6);

    this.activeSessionSignal.set({
      workout,
      sessionId,
      startedAt: new Date(),
      currentExerciseIndex: 0,
      currentSet: 1,
      isPaused: false,
      elapsedSeconds: 0
    });

    return {
      sessionId,
      status: 'InProgress',
      exercisesInSession: workout.exercises
    };
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
