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

// Backend DTOs from WorkOutController.cs
export interface BackendWorkoutViewModel {
  map(arg0: (item: any) => { workoutId: any; name: any; planId: any; category: any; difficulty: any; durationInMinutes: any; caloriesBurn: number; description: string; imageUrl: string; exercisesCount: number; exercises: Exercise[]; }): WorkoutDetails[];
  workoutId: number;
  name: string;
  planId?: string;
  category: string;
  durationInMinutes: number;
  difficulty: string;
}

export interface BackendWorkoutExerciseViewModel {
  exerciseId: number;
  exerciseName: string;
  targetMuscles: string;
  exerciseEquipment: string;
  exerciseDifficulty: string;
  exerciseDescription: string;
  exerciseVideoUrl?: string;
  setsDefault: number;
  repsDefault: number;
  restTimeInSeconds: number;
  orderIndex: number;
}

export interface BackendWorkoutDetailsViewModel {
  workoutId: number;
  planId?: string;
  workoutName: string;
  workoutCategory: string;
  workoutDifficulty: string;
  durationInMinutes: number;
  exercises: BackendWorkoutExerciseViewModel[];
}

export interface BackendWorkoutPlanViewModel {
  planId: string;
  name: string;
  description?: string;
  goal?: string;
  status?: string;
  difficulty?: string;
}

export interface BackendStartSessionExercise {
  id: number;
  exerciseId: number;
  name: string;
  targetMuscles: string;
  equipment: string;
  difficulty: string;
  description: string;
  videoUrl?: string;
  setsDefault: number;
  repsDefault: number;
  restTimeInSeconds: number;
  orderIndex: number;
}

export interface BackendStartSessionResponse {
  sessionId: string;
  status: string;
  exercisesInSession: BackendStartSessionExercise[];
}

// Frontend Domain Models
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