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

export interface FitnessMetrics {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  bmi: number;
  bmiCategory: string;
}
