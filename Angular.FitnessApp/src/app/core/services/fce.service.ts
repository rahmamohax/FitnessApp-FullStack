import { inject, Injectable } from '@angular/core';
import { ActivityLevel, AssignFitnessPlanResponse, CalculateMetricsResponse, FitnessGoal, FitnessMetrics, Gender, normalizeActivityLevel, normalizeFitnessGoal, SubmitFitnessStatsRequest, SubmitFitnessStatsResponse } from '../models/fce.models';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, of, switchMap, tap, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class FceService {
  private readonly apiUrl = `${environment.apiUrl}/fitness`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

   /**
   * Submits user's physical stats (weight, height, age, goal, activity level).
   * FCEService saves stats and publishes UserFitnessUpdatedEvent to RabbitMQ.
   */
  submitFitnessStats(stats: SubmitFitnessStatsRequest):
   Observable<ApiResponse<SubmitFitnessStatsResponse>>{
    const userId = stats.userId || this.authService.currentUser()?.id;
    const payload: SubmitFitnessStatsRequest = {
      ...stats,
      goal: normalizeFitnessGoal(stats.goal),
      activityLevel: normalizeActivityLevel(stats.activityLevel),
      userId
    }
    return this.http.post<ApiResponse<SubmitFitnessStatsResponse>>(
      `${this.apiUrl}/weight-goal-activity`,
      payload
    );
   }

  //Calculates BMR, TDEE, Calorie Target, and Metabolic Status on the backend.
  calculateMetricServer(userId?: string): Observable<ApiResponse<CalculateMetricsResponse>>{
    const id = userId || this.authService.currentUser()?.id;
    return this.http.post<ApiResponse<CalculateMetricsResponse>>(
      `${this.apiUrl}/calculate`,
      {userId: id}
    );
  }

  assignPlan(userId? :string) : Observable<ApiResponse<AssignFitnessPlanResponse>>{
    const id = userId || this.authService.currentUser()?.id;
    return this.http.post<ApiResponse<AssignFitnessPlanResponse>>(
      `${this.apiUrl}/assign-plan`,
      {userId: id}
    );
  }

  getMetrics(userId?: string) : Observable<ApiResponse<CalculateMetricsResponse>>{
    const id = userId || this.authService.currentUser()?.id;
    return this.http.get<ApiResponse<CalculateMetricsResponse>>(
      `${this.apiUrl}/metrics/${id}`
    );
  }

  getStats(userId?: string): Observable<ApiResponse<SubmitFitnessStatsResponse>>{
    const id = userId || this.authService.currentUser()?.id;
    return this.http.get<ApiResponse<SubmitFitnessStatsResponse>>(
      `${this.apiUrl}/stats/${id}`
    );
  }

  /**
   * Full onboarding orchestration:
   * 1. Submits biometric stats
   * 2. Calculates metrics
   * 3. Assigns matching plan
   * 4. Marks profile onboarding complete in AuthService
  */
  calibrateAndAssignPlan(stats: SubmitFitnessStatsRequest): Observable<ApiResponse<AssignFitnessPlanResponse>>{
    const userId = this.authService.currentUser()?.id || stats.userId;
    if(!userId) return throwError(() => new Error('No User ID provided'));
    
    return this.submitFitnessStats({...stats, userId}).pipe(
      switchMap(() => this.calculateMetricServer(userId)),
      switchMap(() => this.assignPlan(userId)),
      tap(() => {
        this.authService.completeProfileOnboarding();
      })
    );
  }

  calculateMetrics(stats: SubmitFitnessStatsRequest): FitnessMetrics {
    const { weight, height, age, gender, goal, activityLevel } = stats;

    // BMR Calculation (Mifflin - St Jeor)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender === Gender.Male) {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // Activity multiplier
    let multiplier = 1.2;
    switch (activityLevel) {
      case ActivityLevel.Rookie:
        multiplier = 1.2;
        break;
      case ActivityLevel.Beginner:
        multiplier = 1.375;
        break;
      case ActivityLevel.Intermediate:
        multiplier = 1.55;
        break;
      case ActivityLevel.Advance:
        multiplier = 1.725;
        break;
      case ActivityLevel.TrueBeast:
        multiplier = 1.9;
        break;
      default:
        multiplier = 1.2;
    }

    const tdee = Math.round(bmr * multiplier);

    // Goal adjustments
    let calorieTarget = tdee;
    switch (goal) {
      case FitnessGoal.LoseWeight:
        calorieTarget = Math.max(1200, tdee - 500);
        break;
      case FitnessGoal.GainWeight:
        calorieTarget = tdee + 450;
        break;
      case FitnessGoal.GetFitter:
        calorieTarget = tdee - 150;
        break;
      case FitnessGoal.GainMoreFlexible:
      case FitnessGoal.LearnTheBasic:
      default:
        calorieTarget = tdee;
    }

    // BMI Calculation
    const heightInMeters = height / 100;
    const bmi = Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
    
    let bmiCategory = 'Normal';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25) bmiCategory = 'Normal';
    else if (bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';

    return {
      bmr: Math.round(bmr),
      tdee,
      calorieTarget,
      bmi,
      bmiCategory
    };
  }
}
