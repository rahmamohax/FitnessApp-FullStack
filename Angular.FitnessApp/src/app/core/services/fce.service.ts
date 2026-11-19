import { Injectable } from '@angular/core';
import { ActivityLevel, FitnessGoal, FitnessMetrics, Gender, SubmitFitnessStatsRequest } from '../models/fce.models';

@Injectable({
  providedIn: 'root'
})
export class FceService {
  /**
   * Calculates metabolic and fitness metrics following Mifflin-St Jeor equation,
   * exactly matching the backend FCEService logic.
   */
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
