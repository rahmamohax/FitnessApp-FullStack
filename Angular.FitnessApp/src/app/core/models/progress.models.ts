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
