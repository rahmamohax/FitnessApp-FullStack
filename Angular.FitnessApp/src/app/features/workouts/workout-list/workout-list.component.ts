import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../../core/services/workout.service';
import { WorkOutCategory, WorkOutDifficulty } from '../../../core/models/workout.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-workout-list',
  imports: [RouterLink, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workout-list.html'
})
export class WorkoutListComponent implements OnInit {
  workoutService = inject(WorkoutService);

  searchQuery = '';
  selectedCategory = signal<string>('all');
  selectedDifficulty = signal<string>('all');

  categories = [
    { value: 'all', label: 'All Muscles' },
    { value: WorkOutCategory.Chest, label: 'Chest' },
    { value: WorkOutCategory.Back, label: 'Back' },
    { value: WorkOutCategory.Legs, label: 'Legs' },
    { value: WorkOutCategory.Shoulders, label: 'Shoulders' },
    { value: WorkOutCategory.FullBody, label: 'Full Body' },
    { value: WorkOutCategory.Stomach, label: 'Core / Abs' }
  ];

  difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: WorkOutDifficulty.Beginner, label: 'Beginner' },
    { value: WorkOutDifficulty.Intermediate, label: 'Intermediate' },
    { value: WorkOutDifficulty.Advanced, label: 'Advanced' }
  ];

  ngOnInit(): void {
    this.workoutService.fetchWorkouts().subscribe();
    this.workoutService.fetchWorkoutPlans().subscribe();
  }

  filteredWorkouts = computed(() => {
    return this.workoutService.getWorkouts({
      category: this.selectedCategory(),
      difficulty: this.selectedDifficulty(),
      search: this.searchQuery
    });
  });

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory.set('all');
    this.selectedDifficulty.set('all');
  }
}
