export enum MealType {
  Breakfast = 'Breakfast',
  Lunch = 'Lunch',
  Dinner = 'Dinner',
  Snack = 'Snack'
}

export interface Meal {
  mealId: number;
  name: string;
  type: MealType | string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  imageUrl?: string;
  prepTimeMinutes?: number;
  ingredients?: string[];
  instructions?: string[];
  tags?: string[];
}

export interface MealPlan {
  planId: number;
  name: string;
  targetCalories: number;
  description: string;
  meals: Meal[];
}

export interface DailyNutritionSummary {
  calorieTarget: number;
  caloriesConsumed: number;
  proteinTarget: number;
  proteinConsumed: number;
  carbsTarget: number;
  carbsConsumed: number;
  fatTarget: number;
  fatConsumed: number;
  waterTargetMl: number;
  waterConsumedMl: number;
  loggedMeals: Array<Meal & { loggedAt: string }>;
}
