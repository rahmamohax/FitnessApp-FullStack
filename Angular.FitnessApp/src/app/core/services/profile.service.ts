import { Injectable, signal, computed, inject } from '@angular/core';
import { UserProfile, UpdateProfileRequest, UserSettings, UpdateSettingsRequest } from '../models/profile.models';
import { ActivityLevel, FitnessGoal, Gender, SubmitFitnessStatsRequest } from '../models/fce.models';
import { FceService } from './fce.service';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private fceService = inject(FceService);

  private readonly STORAGE_KEY = 'super_fitness_profile';
  private readonly SETTINGS_KEY = 'super_fitness_settings';

  private profileSignal = signal<UserProfile>(this.getInitialProfile());
  private settingsSignal = signal<UserSettings>(this.getInitialSettings());

  readonly profile = this.profileSignal.asReadonly();
  readonly settings = this.settingsSignal.asReadonly();

  readonly fullName = computed(() => {
    const p = this.profileSignal();
    return `${p.firstName} ${p.lastName}`.trim();
  });

  private getInitialProfile(): UserProfile {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }

    const defaultStats: SubmitFitnessStatsRequest = {
      age: 25,
      gender: Gender.Male,
      weight: 82.5,
      height: 178,
      goal: FitnessGoal.GetFitter,
      activityLevel: ActivityLevel.Intermediate
    };

    const metrics = this.fceService.calculateMetrics(defaultStats);

    return {
      userId: 'usr_001_rahma',
      firstName: 'Rahma',
      lastName: 'Mohammed',
      email: 'rahma.mohammed@superfitness.com',
      phoneNumber: '+20 102 345 6789',
      profilePictureUrl: '',
      age: defaultStats.age,
      gender: defaultStats.gender,
      weight: defaultStats.weight,
      targetWeight: 78.0,
      height: defaultStats.height,
      goal: defaultStats.goal,
      activityLevel: defaultStats.activityLevel,
      metrics,
      membershipTier: 'Pro',
      joinedDate: 'January 2026'
    };
  }

  private getInitialSettings(): UserSettings {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(this.SETTINGS_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }

    return {
      notificationsEnabled: true,
      workoutReminders: true,
      mealReminders: true,
      units: 'metric',
      theme: 'dark',
      language: 'English (US)',
      soundEffects: true
    };
  }

  private persistProfile(profile: UserProfile): void {
    this.profileSignal.set(profile);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
    }
  }

  private persistSettings(settings: UserSettings): void {
    this.settingsSignal.set(settings);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    }
  }

  updateProfile(request: UpdateProfileRequest): ApiResponse<UserProfile> {
    const current = this.profileSignal();
    const updated: UserProfile = {
      ...current,
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      phoneNumber: request.phoneNumber ?? current.phoneNumber
    };

    this.persistProfile(updated);

    return {
      isSuccess: true,
      message: 'Profile updated successfully.',
      data: updated,
      statusCode: 200,
      timestamp: new Date().toISOString()
    };
  }

  updateMetrics(stats: Partial<SubmitFitnessStatsRequest>): ApiResponse<UserProfile> {
    const current = this.profileSignal();
    const mergedStats: SubmitFitnessStatsRequest = {
      age: stats.age ?? current.age,
      gender: stats.gender ?? current.gender,
      weight: stats.weight ?? current.weight,
      height: stats.height ?? current.height,
      goal: stats.goal ?? current.goal,
      activityLevel: stats.activityLevel ?? current.activityLevel
    };

    const recalculated = this.fceService.calculateMetrics(mergedStats);

    const updated: UserProfile = {
      ...current,
      ...mergedStats,
      metrics: recalculated
    };

    this.persistProfile(updated);

    return {
      isSuccess: true,
      message: 'Fitness metrics updated and recalculated successfully.',
      data: updated,
      statusCode: 200,
      timestamp: new Date().toISOString()
    };
  }

  updateSettings(request: UpdateSettingsRequest): ApiResponse<UserSettings> {
    const current = this.settingsSignal();
    const updated: UserSettings = {
      ...current,
      ...request
    };

    this.persistSettings(updated);

    return {
      isSuccess: true,
      message: 'Settings updated successfully.',
      data: updated,
      statusCode: 200,
      timestamp: new Date().toISOString()
    };
  }

  upgradeSubscription(tier: 'Pro' | 'Elite'): ApiResponse<UserProfile> {
    const current = this.profileSignal();
    const updated: UserProfile = {
      ...current,
      membershipTier: tier
    };

    this.persistProfile(updated);

    return {
      isSuccess: true,
      message: `Successfully upgraded to ${tier} membership!`,
      data: updated,
      statusCode: 200,
      timestamp: new Date().toISOString()
    };
  }
}
