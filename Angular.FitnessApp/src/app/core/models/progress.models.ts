export interface BackendStatisticsSummaryDto {
  totalWorkouts: number;
  totalCaloriesBurned: number;
  totalWeightLost: number;
  updatedAt?: string;
}

export interface BackendWeightHistoryDto {
  weight: number;
  date: string;
  notes?: string;
}

export interface BackendWorkoutHistoryDto {
  id: number;
  durationInMinutes: number;
  caloriesBurned: number;
  completedAt: string;
}

export interface BackendWeekComparisonsDto {
  currentWeekWorkouts: number;
  previousWeekWorkouts: number;
  percentageChange: number;
}

export interface BackendAchievementDto {
  achievementId?: number;
  name: string;
  description?: string;
  iconUrl?: string;
  criteriaType?: number;
  earnedAt?: string;
}

export interface ViewProgressDashboardResponse {
  statisticsSummary?: BackendStatisticsSummaryDto;
  weightHistory?: BackendWeightHistoryDto[];
  workoutHistory?: BackendWorkoutHistoryDto[];
  weekComparisons?: BackendWeekComparisonsDto;
  achievements?: BackendAchievementDto[];
}

export interface BackendLogWeightRequest {
  weight: number;
  date: string;
  notes?: string;
}

export interface ExerciseCompletedDto {
  exerciseId: number;
  setsCompleted: number;
  repsCompleted: number;
  weightUsed: number;
}

export interface BackendWorkoutCompletionRequest {
  workoutId: number;
  sessionId: string;
  durationInMinutes: number;
  caloriesBurned: number;
  rating?: number;
  notes?: string;
  exercisesCompleted: ExerciseCompletedDto[];
}

export interface WorkOutCompletionResponse {
  logId: number;
  updatedStreak: boolean;
  currentStreak: number;
}

export interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  notes?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  progressPercent: number;
}

export interface ProgressStats {
  totalWorkouts: number;
  totalCaloriesBurned: number;
  totalMinutesTrained: number;
  currentStreakDays: number;
  longestStreakDays: number;
  weightLostKg: number;
}

export interface ProgressDashboard {
  stats: ProgressStats;
  recentWeightEntries: WeightEntry[];
  recentWorkouts: Array<{
    workoutId: number;
    name: string;
    completedAt: string;
    durationMinutes: number;
    caloriesBurned: number;
  }>;
  achievements: Achievement[];
}
