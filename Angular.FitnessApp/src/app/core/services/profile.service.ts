import { Injectable, signal, computed, inject } from '@angular/core';
import { UserProfile, UpdateProfileRequest, UserSettings, UpdateSettingsRequest, ViewProfileResponse, UpdateProfileResponse, UploadProfilePictureResponse, ViewSettingsResponse, UpdateBackendSettingsRequest, UpdateSettingsResponse } from '../models/profile.models';
import { ActivityLevel, FitnessGoal, Gender, normalizeActivityLevel, normalizeFitnessGoal, SubmitFitnessStatsRequest } from '../models/fce.models';
import { FceService } from './fce.service';
import { ApiResponse } from '../models/api-response.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { catchError, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
}) 
export class ProfileService {
  private readonly apiUrl = `${environment.apiUrl}`;
  private readonly STORAGE_KEY = 'super_fitness_profile';
  private readonly SETTINGS_KEY = 'super_fitness_settings';

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private fceService = inject(FceService);

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
    const currentUser = this.authService.currentUser();

    return {
      userId: currentUser?.id || '',
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
      phoneNumber: '',
      profilePictureUrl: '',
      age: 0,
      gender: Gender.None,
      weight: 0,
      targetWeight:0,
      height: 0,
      goal: FitnessGoal.None,
      activityLevel: ActivityLevel.None,
      membershipTier: currentUser?.isPremium ? 'Pro' : 'Free',
      joinedDate: 'November 2026'
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

 loadProfile(): Observable<UserProfile> {
    const userId = this.authService.currentUser()?.id;
    if (!userId) {
      return of(this.profileSignal());
    }
    return forkJoin({
      profileRes: this.http.get<ApiResponse<ViewProfileResponse>>(`${this.apiUrl}/profile`),
      statsRes: this.fceService.getStats(userId).pipe(catchError(() => of(null))),
      metricsRes: this.fceService.getMetrics(userId).pipe(catchError(() => of(null))),
    }).pipe(
      map(({ profileRes, statsRes, metricsRes }) => {
        const p = profileRes.data;
        const s = statsRes?.data;
        const m = metricsRes?.data;
        const authUser = this.authService.currentUser();
        const updated: UserProfile = {
          userId: p?.userId?.toString() || userId,
          firstName: p?.firstName || authUser?.firstName || '',
          lastName: p?.lastName || authUser?.lastName || '',
          email: authUser?.email || '',
          phoneNumber: '',
          profilePictureUrl: p?.profilePictureUrl || '',
          age: s?.age ?? 0,
          gender: (s?.gender as Gender) ?? Gender.None,
          weight: s?.weight ?? p?.fceProfile?.weight ?? 0,
          height: s?.height ?? p?.fceProfile?.height ?? 0,
          targetWeight: s?.weight ? Math.round(s.weight * 0.95) : 0,
          goal: normalizeFitnessGoal(s?.goal),
          activityLevel: normalizeActivityLevel(s?.activityLevel),
          metrics: m ? {
            bmr: Math.round(m.bmr),
            tdee: Math.round(m.tdee),
            calorieTarget: Math.round(m.calorieTarget),
            bmi: s?.weight && s?.height ? Math.round((s.weight / Math.pow(s.height / 100, 2)) * 10) / 10 : 0,
            bmiCategory: m.status || 'Normal',
          } : undefined,
          membershipTier: authUser?.isPremium ? 'Pro' : 'Free',
          joinedDate: s?.RecordedAt
            ? new Date(s.RecordedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : 'November 2026',
          progressStatistics: p?.progressStatistics,
        };
        this.persistProfile(updated);
        return updated;
      })
    );
  }

  updateProfile(request: UpdateProfileRequest): Observable<ApiResponse<UpdateProfileResponse>> {
    return this.http.put<ApiResponse<UpdateProfileResponse>>(`${this.apiUrl}/profile`, request).pipe(
      tap(res => {
        if (res.isSuccess){
          const current = this.profileSignal();
          this.persistProfile({
            ...current,
            firstName: request.firstName,
            lastName: request.lastName,
            email: request.email,
            phoneNumber: request.phoneNumber ?? current.phoneNumber
          });
        }
      })
    );
    
  }

  uploadProfilePicture(file: File): Observable<ApiResponse<UploadProfilePictureResponse>> {
    const formData = new FormData();
    formData.append('profilePicture', file, file.name);
    return this.http.post<ApiResponse<UploadProfilePictureResponse>>(`${this.apiUrl}/profile/picture`, formData).pipe(
      tap(res => {
        if (res.isSuccess && res.data?.profilePictureUrl) {
          const current = this.profileSignal();
          this.persistProfile({
            ...current,
            profilePictureUrl: res.data.profilePictureUrl,
          });
        }
      })
    );
  }

  updateMetrics(stats: Partial<SubmitFitnessStatsRequest>): Observable<UserProfile> {
    const current = this.profileSignal();
    const mergedStats: SubmitFitnessStatsRequest = {
      age: stats.age ?? current.age,
      gender: stats.gender ?? current.gender,
      weight: stats.weight ?? current.weight,
      height: stats.height ?? current.height,
      goal: normalizeFitnessGoal(stats.goal ?? current.goal),
      activityLevel: normalizeActivityLevel(stats.activityLevel ?? current.activityLevel),
    };
    return this.fceService.submitFitnessStats(mergedStats).pipe(
      switchMap(() => this.fceService.calculateMetricServer()),
      switchMap(() => this.loadProfile())
    );
  }

    loadSettings(): Observable<UserSettings> {
    return this.http.get<ApiResponse<ViewSettingsResponse>>(`${this.apiUrl}/settings`).pipe(
      map(res => {
        const pref = res.data?.userPreferences;
        const notif = res.data?.notificationSettings;
        const priv = res.data?.privacySettings;

        const isImperial = pref?.weightUnit?.toLowerCase() === 'lbs' || pref?.heightUnit?.toLowerCase() === 'in';
        const current = this.settingsSignal();

        const updated: UserSettings = {
          ...current,
          notificationsEnabled: notif?.pushNotifications ?? current.notificationsEnabled,
          workoutReminders: notif?.workoutReminders ?? current.workoutReminders,
          mealReminders: notif?.mealReminders ?? current.mealReminders,
          pushNotifications: notif?.pushNotifications ?? true,
          emailNotifications: notif?.emailNotifications ?? true,
          achievementAlerts: notif?.achievementAlerts ?? true,
          weeklyReports: notif?.weeklyReports ?? true,
          units: isImperial ? 'imperial' : 'metric',
          theme: (pref?.theme?.toLowerCase() === 'light' ? 'light' : 'dark'),
          language: pref?.language || current.language,
          profileVisibility: priv?.profileVisibility || 'Public',
          showProgressToFriends: priv?.showProgressToFriends ?? false,
          allowDataSharing: priv?.allowDataSharing ?? false,
        };

        this.persistSettings(updated);
        return updated;
      }),
      catchError(() => of(this.settingsSignal()))
    );
  }
  updateSettings(request: UpdateSettingsRequest): Observable<UserSettings> {
    const current = this.settingsSignal();
    const updated: UserSettings = {
      ...current,
      ...request
    };

    this.persistSettings(updated);
    
    const payload: UpdateBackendSettingsRequest = request.backendPayload ?? {};

    if(request.units !== undefined){
      payload.preferences = {
        ...payload.preferences,
        weightUnit: request.units === 'imperial' ? 'lbs' : 'kg',
        heightUnit: request.units === 'imperial' ? 'in' : 'cm',
        distanceUnit: request.units === 'imperial' ? 'mi' : 'km'
      };
    }

    if(request.language !== undefined){
      payload.preferences = {
        ...payload.preferences,
        language: request.language
      };
    }

    if(request.theme !== undefined){
      payload.preferences = {
        ...payload.preferences,
        theme: request.theme
      };
    }

    if(request.notificationsEnabled !== undefined){
      payload.notifications = {
        ...payload.notifications,
        pushNotifications: request.notificationsEnabled,
        workoutReminders: request.notificationsEnabled,
        mealReminders: request.notificationsEnabled,
        achievementAlerts: request.notificationsEnabled,
        weeklyReports: request.notificationsEnabled,
        emailNotifications: request.notificationsEnabled
      };
    }

    return this.http.put<ApiResponse<UpdateSettingsResponse>>(`${this.apiUrl}/settings`, payload).pipe(
      map(() => updated),
      catchError(() => of(updated))
    );
  }

  upgradeSubscription(tier: 'Pro' | 'Elite'): void {
    const current = this.profileSignal();
    const updated: UserProfile = {
      ...current,
      membershipTier: tier
    };

    this.persistProfile(updated);
  }
}
