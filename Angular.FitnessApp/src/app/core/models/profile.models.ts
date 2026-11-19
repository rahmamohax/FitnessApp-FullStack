import { Gender, FitnessGoal, ActivityLevel, FitnessMetrics } from './fce.models';

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  age: number;
  gender: Gender;
  weight: number; // in kg
  targetWeight?: number;
  height: number; // in cm
  goal: FitnessGoal;
  activityLevel: ActivityLevel;
  metrics?: FitnessMetrics;
  membershipTier: 'Free' | 'Pro' | 'Elite';
  joinedDate: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  workoutReminders: boolean;
  mealReminders: boolean;
  units: 'metric' | 'imperial';
  theme: 'dark' | 'light';
  language: string;
  soundEffects: boolean;
}

export interface UpdateSettingsRequest {
  notificationsEnabled?: boolean;
  workoutReminders?: boolean;
  mealReminders?: boolean;
  units?: 'metric' | 'imperial';
  theme?: 'dark' | 'light';
  language?: string;
  soundEffects?: boolean;
}
