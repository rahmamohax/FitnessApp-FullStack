import { Injectable, signal, computed, inject } from '@angular/core';
import { DailyNutritionSummary, GetMealRecommendationsResponse, Meal, MealDetailsResponse, MealPlan, MealPlansResponse, MealType } from '../models/nutrition.models';
import { ProfileService } from './profile.service';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  private apiUrl = `${environment.apiUrl}/nutrition`;
  private http = inject(HttpClient);
  private profileService = inject(ProfileService);

  private readonly defaultMealImages: Record<string, string> = {
    breakfast: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    dinner: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    snack: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80',
  };

  private mealsSignal = signal<Meal[]>([]);
  private mealPlansSignal = signal<MealPlansResponse[]>([]);
  private dailyTrackerSignal = signal<DailyNutritionSummary>(this.getInitalDailyTracker());

  readonly meals = this.mealsSignal.asReadonly();
  readonly mealPlans = this.mealPlansSignal.asReadonly();
  readonly dailyTracker = this.dailyTrackerSignal.asReadonly();

  readonly remainingCalories = computed(() => {
    const t = this.dailyTrackerSignal();
    return Math.max(0, t.calorieTarget - t.caloriesConsumed);
  });

  constructor() {
    // Automatically seed initial recommended meals and plans from backend microservices
    if (typeof window !== 'undefined') {
      this.fetchMealRecommendations().subscribe();
      this.fetchMealPlans().subscribe();
    }
  }

  private getTodayKey(): string {
    const today = new Date().toISOString().split('T')[0];
    return `super_fitness_nutrition_${today}`;
  }

  getInitalDailyTracker(): DailyNutritionSummary {
    const calorieTarget = this.profileService.profile()?.metrics?.calorieTarget || 2200;
    const proteinTarget = Math.round((calorieTarget * 0.3) / 4);
    const carbsTarget = Math.round((calorieTarget * 0.45) / 4);
    const fatTarget = Math.round((calorieTarget * 0.25) / 9);

    const baseTracker: DailyNutritionSummary = {  
      calorieTarget,
      caloriesConsumed: 0,
      proteinTarget,
      proteinConsumed: 0,
      carbsTarget,
      carbsConsumed: 0,
      fatTarget,
      fatConsumed: 0,
      waterTargetMl: 3000,
      waterConsumedMl: 0,
      loggedMeals: []
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(this.getTodayKey());
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...baseTracker,
            ...parsed,
            calorieTarget: baseTracker.calorieTarget,
            proteinTarget: baseTracker.proteinTarget,
            carbsTarget: baseTracker.carbsTarget,
            fatTarget: baseTracker.fatTarget
          };
        } catch {}
      }
    }

    return baseTracker;
  }

  private persistDailyTracker(tracker: DailyNutritionSummary): void {
    this.dailyTrackerSignal.set(tracker);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.getTodayKey(), JSON.stringify(tracker));
    }
  }

    fetchMealRecommendations(filterParams?: {
    mealType?: MealType | string;
    maxCalories?: number;
    minProtein?: number;
    page?: number;
    pageSize?: number;
  }): Observable<Meal[]> {
    let params = new HttpParams()
      .set('Page', (filterParams?.page ?? 1).toString())
      .set('PageSize', (filterParams?.pageSize ?? 20).toString());

    if (filterParams?.mealType && filterParams.mealType !== 'all') {
      params = params.set('MealType', filterParams.mealType);
    }
    if (filterParams?.maxCalories) {
      params = params.set('MaxCalories', filterParams.maxCalories.toString());
    }
    if (filterParams?.minProtein) {
      params = params.set('MinProtein', filterParams.minProtein.toString());
    }
    return this.http.get<ApiResponse<GetMealRecommendationsResponse>>(`${this.apiUrl}/recommendations`, { params }).pipe(
      map(res => {
        const d = res.data;
        if (!d?.recommendedMeals?.items || d.recommendedMeals.items.length === 0) {
          return this.mealsSignal();
        }
        // Calibrate daily goal calorie target if returned from backend
        if (d.userDailyGoalCalories > 0) {
          const current = this.dailyTrackerSignal();
          if (current.calorieTarget !== d.userDailyGoalCalories) {
            const cal = Math.round(d.userDailyGoalCalories);
            this.persistDailyTracker({
              ...current,
              calorieTarget: cal,
              proteinTarget: Math.round((cal * 0.3) / 4),
              carbsTarget: Math.round((cal * 0.45) / 4),
              fatTarget: Math.round((cal * 0.25) / 9)
            });
          }
        }
        const mapped: Meal[] = d.recommendedMeals.items.map(item => {
          const typeKey = (item.type || '').toLowerCase();
          let tags: string[] = [];
          if (item.tagsJson) {
            try {
              tags = JSON.parse(item.tagsJson);
            } catch {
              tags = [item.type];
            }
          }
          return {
            mealId: item.mealId,
            name: item.name,
            type: item.type,
            calories: Math.round(item.calories),
            protein: Math.round(item.protein),
            carbs: Math.round(item.carbs),
            fat: Math.round(item.fats),
            imageUrl: this.defaultMealImages[typeKey] || this.defaultMealImages['lunch'],
            prepTimeMinutes: 15,
            tags: tags.length > 0 ? tags : [item.type, `${Math.round(item.protein)}g Protein`]
          };
        });
        this.mealsSignal.set(mapped);
        return mapped;
      }),
      catchError(() => of(this.mealsSignal()))
    );
  }
  
    fetchMealDetails(id: number): Observable<Meal> {
    return this.http.get<ApiResponse<MealDetailsResponse>>(`${this.apiUrl}/meals/${id}`).pipe(
      map(res => {
        const d = res.data;
        if (!d) throw new Error('Meal not found');
        const typeKey = (d.type || '').toString().toLowerCase();
        const parseArray = (val: any): string[] => {
          if (!val) return [];
          if (Array.isArray(val)) return val.map(v => typeof v === 'string' ? v : JSON.stringify(v));
          if (typeof val === 'string') {
            try {
              const p = JSON.parse(val);
              if (Array.isArray(p)) return p;
            } catch {}
            return [val];
          }
          return [];
        };
        const existing = this.mealsSignal().find(m => m.mealId === id);
        const details: Meal = {
          mealId: id,
          name: d.name,
          type: d.type.toString(),
          calories: Math.round(d.calories),
          protein: Math.round(d.protein),
          carbs: Math.round(d.carbs),
          fat: Math.round(d.fats),
          imageUrl: existing?.imageUrl || this.defaultMealImages[typeKey] || this.defaultMealImages['lunch'],
          prepTimeMinutes: existing?.prepTimeMinutes || 20,
          ingredients: parseArray(d.ingredients),
          instructions: parseArray(d.instructions),
          tags: parseArray(d.tags)
        };
        // Cache into signal
        this.mealsSignal.update(list => {
          const idx = list.findIndex(m => m.mealId === id);
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...details };
            return [...list];
          }
          return [...list, details];
        });
        return details;
      }),
      catchError(() => {
        const fallback = this.getMealById(id);
        return of(fallback as Meal);
      })
    );
  }

  fetchMealPlans(): Observable<MealPlansResponse[]> {
    return this.http.get<ApiResponse<MealPlansResponse[]>>(`${this.apiUrl}/meal-plans`).pipe(
      map(res => {
        const items = res.data || [];
        this.mealPlansSignal.set(items);
        return items;
      }),
      catchError(() => of(this.mealPlansSignal()))
    );
  }

  getMealsByType(type: MealType | string): Meal[] {
    if (!type || type.toLowerCase() === 'all') return this.mealsSignal();
    return this.mealsSignal().filter(m => m.type.toLowerCase() === type.toLowerCase());
  }

  getMealById(id: number): Meal | undefined {
    return this.mealsSignal().find(m => m.mealId === id);
  }

  logMeal(meal: Meal): ApiResponse<DailyNutritionSummary> {
    const current = this.dailyTrackerSignal();
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated: DailyNutritionSummary = {
      ...current,
      caloriesConsumed: current.caloriesConsumed + meal.calories,
      proteinConsumed: current.proteinConsumed + meal.protein,
      carbsConsumed: current.carbsConsumed + meal.carbs,
      fatConsumed: current.fatConsumed + meal.fat,
      loggedMeals: [
        {
          ...meal,
          loggedAt: timeString
        },
        ...current.loggedMeals
      ]
    };
    this.persistDailyTracker(updated);
    return {
      isSuccess: true,
      message: `${meal.name} logged successfully to daily intake!`,
      data: updated,
      statusCode: 200,
      timestamp: new Date().toISOString()
    };
  }

  addWater(amountMl: number = 250): void {
    const current = this.dailyTrackerSignal();
    const updated: DailyNutritionSummary = {
      ...current,
      waterConsumedMl: current.waterConsumedMl + amountMl
    };
    this.persistDailyTracker(updated);
  }
}
