import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-toast',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl glass-panel shadow-2xl transition-all duration-300 animate-slide-in"
          [class.border-emerald-500]="toast.type === 'success'"
          [class.border-blue-500]="toast.type === 'info'"
          [class.border-amber-500]="toast.type === 'warning'"
          [class.border-rose-500]="toast.type === 'error'"
        >
          <div class="shrink-0 mt-0.5">
            @switch (toast.type) {
              @case ('success') {
                <div class="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <app-icon name="check" size="16"/>
                </div>
              }
              @case ('warning') {
                <div class="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <app-icon name="activity" size="16"/>
                </div>
              }
              @case ('error') {
                <div class="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <app-icon name="x" size="16"/>
                </div>
              }
              @default {
                <div class="w-7 h-7 rounded-full bg-orange-500/20 text-[#FF5722] flex items-center justify-center">
                  <app-icon name="sparkles" size="16"/>
                </div>
              }
            }
          </div>

          <div class="flex-1 min-w-0">
            @if (toast.title) {
              <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-0.5">{{ toast.title }}</h4>
            }
            <p class="text-xs text-slate-200 leading-relaxed">{{ toast.message }}</p>
          </div>

          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Dismiss notification"
          >
            <app-icon name="x" size="14"/>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
