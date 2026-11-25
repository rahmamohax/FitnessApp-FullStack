export enum Gender {
  None = 'None',
  Male = 'Male',
  Female = 'Female'
}

export enum FitnessGoal {
  None = 'None',
  LoseWeight = 'Lose Weight',
  GetFitter = 'Get Fitter',
  GainWeight = 'Gain Weight',
  GainMoreFlexible = 'Gain More Flexible',
  LearnTheBasic = 'Learn the Basic'
}

export enum ActivityLevel {
  None = 'None',
  Rookie = 'Rookie',
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advance = 'Advance',
  TrueBeast = 'TrueBeast'
}

export interface SubmitFitnessStatsRequest {
  userId?: string;
  weight: number; // in kg
  height: number; // in cm
  age: number;
  gender: Gender;
  goal: FitnessGoal;
  activityLevel: ActivityLevel;
}

export interface SubmitFitnessStatsResponse {
  id: number;
  userId?: string;
  weight: number; // in kg
  height: number; // in cm
  age: number;
  gender: string;
  goal: string;
  activityLevel: string;
  RecordedAt: string;
}

export interface CalculateMetricsResponse {
  userId: string;
  bmr: number;
  tdee: number;
  calorieTarget: number;
  status: string;
  calculatedAt: string;
  lastUpdatedAt?: string;
}

export interface AssignFitnessPlanResponse {
  planId: string;
  planName: string;
  description: string;
  goal: string;
  status: string;
  minCalorie: number;
  maxCalorie: number;
  estimatedDuration: string;
  workoutsPerWeek: number;
  programType: string;
  assignedAt: string;
}

// Client-side preview and local calculation structure
export interface FitnessMetrics {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  bmi: number;
  bmiCategory: string;
}

export function normalizeFitnessGoal(goal: any): FitnessGoal {
  if (!goal) return FitnessGoal.None;
  const str = goal.toString().toLowerCase().replace(/[\s_-]+/g, '');
  switch (str) {
    case 'loseweight':
      return FitnessGoal.LoseWeight; // 'Lose Weight'
    case 'getfitter':
      return FitnessGoal.GetFitter; // 'Get Fitter'
    case 'gainweight':
      return FitnessGoal.GainWeight; // 'Gain Weight'
    case 'gainmoreflexible':
      return FitnessGoal.GainMoreFlexible; // 'Gain More Flexible'
    case 'learnthebasic':
      return FitnessGoal.LearnTheBasic; // 'Learn the Basic'
    default:
      return FitnessGoal.None;
  }
}

export function normalizeActivityLevel(activity: any): ActivityLevel {
  if (!activity) return ActivityLevel.None;
  const str = activity.toString().toLowerCase().replace(/[\s_-]+/g, '');
  switch (str) {
    case 'rookie':
      return ActivityLevel.Rookie;
    case 'beginner':
      return ActivityLevel.Beginner;
    case 'intermediate':
      return ActivityLevel.Intermediate;
    case 'advance':
    case 'advanced':
      return ActivityLevel.Advance;
    case 'truebeast':
      return ActivityLevel.TrueBeast;
    default:
      return ActivityLevel.None;
  }
}