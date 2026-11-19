import { Injectable, signal, computed, inject } from '@angular/core';
import { DailyNutritionSummary, Meal, MealPlan, MealType } from '../models/nutrition.models';
import { ProfileService } from './profile.service';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  private profileService = inject(ProfileService);

  private mealsSignal = signal<Meal[]>([
    {
      mealId: 1,
      name: 'Avocado Toast with Poached Eggs & Chia',
      type: MealType.Breakfast,
      calories: 420,
      protein: 24,
      carbs: 38,
      fat: 18,
      imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
      prepTimeMinutes: 15,
      ingredients: [
        '2 slices whole grain sourdough bread',
        '2 organic pasture-raised eggs',
        '1/2 ripe avocado mashed with lime',
        '1 tsp black chia seeds',
        'Pinch of red pepper flakes and sea salt'
      ],
      instructions: [
        'Toast the sourdough bread slices until golden crisp.',
        'Poach eggs in simmering water with a drop of vinegar for 3 minutes.',
        'Spread fresh avocado evenly across the warm toasts.',
        'Place poached eggs gently on top, sprinkle with chia and red chili flakes.'
      ],
      tags: ['High Protein', 'Healthy Fats', 'Quick Prep']
    },
    {
      mealId: 2,
      name: 'High-Protein Greek Yogurt Parfait',
      type: MealType.Breakfast,
      calories: 340,
      protein: 30,
      carbs: 42,
      fat: 6,
      imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
      prepTimeMinutes: 5,
      ingredients: [
        '250g 0% fat Greek Yogurt',
        '50g mixed fresh blueberries & raspberries',
        '30g homemade rolled oats granola',
        '1 scoop vanilla whey isolate',
        '1 tsp raw organic honey'
      ],
      instructions: [
        'Whisk vanilla protein isolate into Greek yogurt until smooth.',
        'Layer half the yogurt in a glass, top with mixed berries and granola.',
        'Add remaining yogurt and finish with honey drizzle.'
      ],
      tags: ['Low Fat', '30g Protein', 'Antioxidants']
    },
    {
      mealId: 3,
      name: 'Grilled Herb Chicken & Quinoa Harvest Bowl',
      type: MealType.Lunch,
      calories: 540,
      protein: 48,
      carbs: 52,
      fat: 14,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      prepTimeMinutes: 25,
      ingredients: [
        '180g lean chicken breast, marinated in rosemary & garlic',
        '1 cup cooked tricolor quinoa',
        '1 cup roasted broccoli florets & bell peppers',
        '1 tbsp lemon tahini dressing',
        'Fresh chopped parsley'
      ],
      instructions: [
        'Grill seasoned chicken breast for 6-7 minutes per side until 165°F internal temperature.',
        'Warm the fluffy quinoa and place at base of bowl.',
        'Arrange sliced grilled chicken and roasted vegetables alongside.',
        'Drizzle with lemon tahini dressing and fresh parsley.'
      ],
      tags: ['Lean Muscle', 'Complex Carbs', 'Gluten Free']
    },
    {
      mealId: 4,
      name: 'Wild Salmon Fillet with Asparagus & Sweet Potato',
      type: MealType.Dinner,
      calories: 580,
      protein: 44,
      carbs: 46,
      fat: 22,
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
      prepTimeMinutes: 30,
      ingredients: [
        '200g wild Atlantic salmon fillet',
        '1 medium baked sweet potato with cinnamon',
        '150g grilled green asparagus spears',
        '1 tbsp extra virgin olive oil',
        'Lemon wedge and dill'
      ],
      instructions: [
        'Preheat oven to 400°F (200°C).',
        'Season salmon and asparagus with olive oil, salt, pepper, and fresh dill.',
        'Roast salmon and asparagus for 14-16 minutes until salmon flakes tenderly.',
        'Serve with split baked sweet potato and lemon wedge.'
      ],
      tags: ['Omega-3 Rich', 'Cardio Health', 'Clean Dinner']
    },
    {
      mealId: 5,
      name: 'Whey Protein Berry Power Shake',
      type: MealType.Snack,
      calories: 260,
      protein: 28,
      carbs: 26,
      fat: 4,
      imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80',
      prepTimeMinutes: 3,
      ingredients: [
        '1 scoop chocolate or vanilla whey isolate',
        '1 cup unsweetened almond milk',
        '1/2 frozen banana',
        '1/2 cup frozen dark berries',
        '1 tbsp ground flaxseeds'
      ],
      instructions: [
        'Add all ingredients into high-speed blender.',
        'Blend on high for 45 seconds until frosty and smooth.',
        'Drink immediately post-workout.'
      ],
      tags: ['Post-Workout', 'Rapid Recovery', 'Quick Prep']
    }
  ]);

  private dailyTrackerSignal = signal<DailyNutritionSummary>({
    calorieTarget: 2250,
    caloriesConsumed: 1240,
    proteinTarget: 160,
    proteinConsumed: 96,
    carbsTarget: 220,
    carbsConsumed: 132,
    fatTarget: 65,
    fatConsumed: 38,
    waterTargetMl: 3000,
    waterConsumedMl: 2250,
    loggedMeals: [
      {
        mealId: 1,
        name: 'Avocado Toast with Poached Eggs & Chia',
        type: MealType.Breakfast,
        calories: 420,
        protein: 24,
        carbs: 38,
        fat: 18,
        loggedAt: '08:30 AM'
      },
      {
        mealId: 3,
        name: 'Grilled Herb Chicken & Quinoa Harvest Bowl',
        type: MealType.Lunch,
        calories: 540,
        protein: 48,
        carbs: 52,
        fat: 14,
        loggedAt: '01:15 PM'
      },
      {
        mealId: 5,
        name: 'Whey Protein Berry Power Shake',
        type: MealType.Snack,
        calories: 260,
        protein: 28,
        carbs: 26,
        fat: 4,
        loggedAt: '04:30 PM'
      }
    ]
  });

  readonly meals = this.mealsSignal.asReadonly();
  readonly dailyTracker = this.dailyTrackerSignal.asReadonly();

  readonly remainingCalories = computed(() => {
    const t = this.dailyTrackerSignal();
    return Math.max(0, t.calorieTarget - t.caloriesConsumed);
  });

  getMealsByType(type: MealType | string): Meal[] {
    if (type.toLowerCase() === 'all') return this.mealsSignal();
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
        ...current.loggedMeals,
        {
          ...meal,
          loggedAt: timeString
        }
      ]
    };

    this.dailyTrackerSignal.set(updated);

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
    this.dailyTrackerSignal.set({
      ...current,
      waterConsumedMl: current.waterConsumedMl + amountMl
    });
  }
}
