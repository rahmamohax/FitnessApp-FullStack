import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { NutritionService } from '../../core/services/nutrition.service';
import { ToastService } from '../../core/services/toast.service';
import { Meal, MealType } from '../../core/models/nutrition.models';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-nutrition',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nutrition.html' 
})
export class NutritionComponent implements OnInit{
  nutritionService = inject(NutritionService);
  private toastService = inject(ToastService);

  selectedMealTab = signal<string>('all');
  activeMealModal = signal<Meal | null>(null);

  mealTabs = [
    { value: 'all', label: 'All Recipes' },
    { value: MealType.Breakfast, label: 'Breakfast' },
    { value: MealType.Lunch, label: 'Lunch' },
    { value: MealType.Dinner, label: 'Dinner' },
    { value: MealType.Snack, label: 'Snacks & Shakes' }
  ];

  ngOnInit(): void {
    this.nutritionService.fetchMealRecommendations().subscribe();
  }

  filteredMeals = computed(() => {
    return this.nutritionService.getMealsByType(this.selectedMealTab());
  });

  openMealDetails(meal: Meal): void {
    this.activeMealModal.set(meal);

    this.nutritionService.fetchMealDetails(meal.mealId).subscribe({
      next: (fullMeal) => {
        if (this.activeMealModal()?.mealId === fullMeal.mealId) {
          this.activeMealModal.set(fullMeal);
        }
      }
    });
  }

  closeMealDetails(): void {
    this.activeMealModal.set(null);
  }

  logMeal(meal: Meal): void {
    this.nutritionService.logMeal(meal);
    this.toastService.success(`Logged ${meal.name} (+${meal.calories} kcal)`, 'Meal Logged');
  }

  logMealAndClose(meal: Meal): void {
    this.logMeal(meal);
    this.closeMealDetails();
  }
  
  addWater(): void {
    this.nutritionService.addWater(250);
    this.toastService.success('Added 250ml water intake!', 'Hydration');
  }
  
}
