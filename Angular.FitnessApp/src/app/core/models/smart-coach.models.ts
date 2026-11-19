import { Workout } from './workout.models';
import { Meal } from './nutrition.models';

export interface HomeFeedProfileSection {
  displayName: string;
  profilePictureUrl?: string;
  height?: number;
  weight?: number;
}

export interface HomeFeedMetricsSection {
  bmr: number;
  tdee: number;
  calorieTarget: number;
}

export interface HomeFeedNutritionSection {
  dailyGoalCalories: number;
  recommendedMeals: Array<{
    mealId: number;
    name: string;
    type: string;
    calories: number;
    protein: number;
  }>;
}

export interface HomeFeedProgressSection {
  totalWorkouts: number;
  totalCaloriesBurned: number;
  totalWeightLost: number;
  currentStreak: number;
  longestStreak: number;
}

export interface HomeFeedResponse {
  profile: HomeFeedProfileSection | null;
  metrics: HomeFeedMetricsSection | null;
  suggestedWorkouts: Workout[];
  nutrition: HomeFeedNutritionSection | null;
  progress: HomeFeedProgressSection | null;
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  actionCard?: {
    type: 'workout' | 'nutrition' | 'tip';
    title: string;
    subtitle: string;
    actionLabel: string;
    actionRoute: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  preview: string;
}
