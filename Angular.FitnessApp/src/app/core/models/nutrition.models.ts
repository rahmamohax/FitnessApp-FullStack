export enum MealType {
  Breakfast = 'Breakfast',
  Lunch = 'Lunch',
  Dinner = 'Dinner',
  Snack = 'Snack'
}

export interface MealRecommendationDto {
  mealId: number;
  name: string;
  type: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  tagsJson?: string;
}

export interface GetMealRecommendationsResponse {
  userDailyGoalCalories: number;
  recommendedMeals: {
    items: MealRecommendationDto[];
    pageIndex: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface MealDetailsResponse {
  name: string;
  type: MealType | string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: any;
  instructions: any;
  variations?: any;
  allergens?: any;
  tags?: any;
}

export interface MealPlanItemResponse {
  mealName: string;
  mealCalories: number;
  dayOfWeek: string;
  mealTime: string;
}

export interface MealPlansResponse {
  name: string;
  description: string;
  targetCalorieRangeMin: number;
  targetCalorieRangeMax: number;
  items: MealPlanItemResponse[];
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
