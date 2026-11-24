import { Gender, FitnessGoal, ActivityLevel, FitnessMetrics } from './fce.models';

export interface ProgressStatistics{
  totalWorkouts: number;
  currentStreak: number;
  totalCaloriesBurned: number;
  totalWeightLost: number;
  longestStreak: number;
}

export interface ViewProfileResponse {
  userId: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  fceProfile?: {
    height?: number;
    weight?: number;
  };
  progressStatistics?: ProgressStatistics;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}
export interface UpdateProfileResponse {
  isSuccess: boolean;
}

export interface UploadProfilePictureResponse {
  profilePictureUrl: string;
}

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
  progressStatistics?: ProgressStatistics;
}

export interface UserPreferencesDto {
  language: string;
  theme: string;
  weightUnit: string;
  heightUnit: string;
  distanceUnit: string;
}

export interface NotificationSettingsDto {
  workoutReminders: boolean;
  mealReminders: boolean;
  achievementAlerts: boolean;
  weeklyReports: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}
export interface PrivacySettingsDto {
  profileVisibility: string;
  showProgressToFriends: boolean;
  allowDataSharing: boolean;
}
export interface ViewSettingsResponse {
  userPreferences: UserPreferencesDto;
  notificationSettings: NotificationSettingsDto;
  privacySettings: PrivacySettingsDto;
}

export enum ProfileVisibilityEnum {
  Private = 1,
  Public = 2
}

export interface PreferenceSettingsDto {
  language?: string;
  theme?: string;
  weightUnit?: string;
  heightUnit?: string;
  distanceUnit?: string;
}
export interface UpdateNotificationDto {
  workoutReminders?: boolean;
  mealReminders?: boolean;
  achievementAlerts?: boolean;
  weeklyReports?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface UpdatePrivacySettingsDto {
  profileVisibility?: ProfileVisibilityEnum;
  showProgressToFriends?: boolean;
  allowDataSharing?: boolean;
}
export interface UpdateBackendSettingsRequest {
  preferences?: PreferenceSettingsDto;
  notifications?: UpdateNotificationDto;
  privacy?: UpdatePrivacySettingsDto;
}
export interface UpdateSettingsResponse {
  success: boolean;
}

// Frontend Model
export interface UserSettings {
  notificationsEnabled: boolean;
  workoutReminders: boolean;
  mealReminders: boolean;
  units: 'metric' | 'imperial';
  theme: 'dark' | 'light';
  language: string;
  soundEffects: boolean;
  pushNotifications?: boolean;
  emailNotifications?: boolean;
  achievementAlerts?: boolean;
  weeklyReports?: boolean;
  profileVisibility?: string;
  showProgressToFriends?: boolean;
  allowDataSharing?: boolean;
}

export interface UpdateSettingsRequest {
  notificationsEnabled?: boolean;
  workoutReminders?: boolean;
  mealReminders?: boolean;
  units?: 'metric' | 'imperial';
  theme?: 'dark' | 'light';
  language?: string;
  soundEffects?: boolean;
  backendPayload?: UpdateBackendSettingsRequest;
}
