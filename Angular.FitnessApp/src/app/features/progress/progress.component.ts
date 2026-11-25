import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressService } from '../../core/services/progress.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-progress',
  imports: [FormsModule, IconComponent, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress.html' 
})
export class ProgressComponent implements OnInit {
  progressService = inject(ProgressService);
  private toastService = inject(ToastService);

  openWeightModal = signal<boolean>(false);
  newWeight = 82.0;
  newWeightNotes = 'Weekly check-in';

  ngOnInit(): void {
    this.progressService.loadDashboard().subscribe();
  }

  unlockedAchievementsCount(): number {
    return this.progressService.achievements().filter(a => a.isUnlocked).length;
  }

  submitWeight(): void {
    if (this.newWeight < 30 || this.newWeight > 300) {
      this.toastService.error('Please enter a valid weight between 30 and 300 kg.');
      return;
    }

    this.progressService.logWeight(this.newWeight, this.newWeightNotes)
    .subscribe({
      next: () => {
        this.toastService.success(`Logged ${this.newWeight} kg successfully!`, 'Weight Recorded');
        this.openWeightModal.set(false);
      },
      error: () => {
        this.toastService.error('Failed to log weight entry.', 'Error');
      }
    });
  }
}
