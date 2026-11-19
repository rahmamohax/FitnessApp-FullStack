export enum WorkOutCategory {
  FullBody = 'fullBody',
  Chest = 'chest',
  Back = 'back',
  Shoulders = 'shoulders',
  Arms = 'arms',
  Legs = 'legs',
  Stomach = 'stomach'
}

export { WorkOutCategory as WorkoutCategory };

export enum WorkOutDifficulty {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced'
}

export { WorkOutDifficulty as WorkoutDifficulty };

export interface Exercise {
  exerciseId: number;
  name: string;
  targetMuscles: string;
  equipment: string;
  difficulty: string;
  description: string;
  videoUrl?: string;
  imageUrl?: string;
  setsDefault: number;
  repsDefault: number;
  restTimeInSeconds: number;
  orderIndex: number;
}

export interface Workout {
  workoutId: number;
  name: string;
  planId?: string;
  category: WorkOutCategory | string;
  durationInMinutes: number;
  difficulty: WorkOutDifficulty | string;
  caloriesBurn: number;
  description?: string;
  imageUrl?: string;
  exercisesCount?: number;
}

export interface WorkoutDetails extends Workout {
  description: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  planId: string;
  name: string;
  description?: string;
  goal?: string;
  status?: string;
  difficulty?: string;
  workoutsCount?: number;
  durationWeeks?: number;
}

export interface StartWorkoutSessionResponse {
  sessionId: string;
  status: string;
  exercisesInSession: Exercise[];
}

export interface WorkoutCompletionRequest {
  workoutId: number;
  sessionId?: string;
  durationInMinutes: number;
  caloriesBurned: number;
  rating?: number;
  notes?: string;
  exercisesCompleted: number;
}
