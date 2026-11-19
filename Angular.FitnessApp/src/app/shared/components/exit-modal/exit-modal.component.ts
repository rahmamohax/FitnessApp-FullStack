import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-exit-modal',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="relative w-full max-w-sm rounded-3xl bg-[#16161F] border border-white/10 p-6 text-center shadow-2xl">
        <!-- Close icon button -->
        <button
          type="button"
          (click)="cancel.emit()"
          class="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
          aria-label="Close dialog"
        >
          <app-icon name="x" size="18"/>
        </button>

        <!-- Graphic -->
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center glow-orange-sm">
          <app-icon name="logout" size="28"/>
        </div>

        <h3 id="modal-title" class="text-xl font-bold text-white mb-2">
          Are you sure you want to exit?
        </h3>
        <p class="text-sm text-slate-400 mb-6">
          You will return to the welcome screen. Your saved workouts and nutrition logs will be safely kept.
        </p>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="cancel.emit()"
            class="flex-1 py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-slate-200 font-semibold text-sm hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            (click)="confirm.emit()"
            class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[#FF5722]/30"
          >
            Yes, Exit
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in {
      animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class ExitModalComponent {
  confirm = output<void>();
  cancel = output<void>();
}
