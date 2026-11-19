import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink, ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0D0D12] text-white flex flex-col justify-center p-6 max-w-md mx-auto relative">
      <!-- Back Button -->
      <a routerLink="/auth/login" class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-8 transition-colors">
        <app-icon name="arrow-left" size="16"/>
        <span>Back to Login</span>
      </a>

      <!-- Header matching Figma OTP 1 -->
      <header class="mb-8">
        <div class="w-14 h-14 mb-4 rounded-2xl bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center glow-orange-sm">
          <app-icon name="lock" size="26"/>
        </div>
        <h1 class="text-2xl font-black uppercase tracking-tight text-white mb-2">Forgot Password</h1>
        <p class="text-xs text-slate-400 leading-relaxed">
          Enter your registered email address and we will send a 6-digit verification code to reset your password.
        </p>
      </header>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label for="email" class="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Email Address</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <app-icon name="mail" size="18"/>
            </span>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="athlete@superfitness.com"
              class="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#161622] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF5722] transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          [disabled]="form.invalid || isSubmitting()"
          class="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white font-bold text-sm hover:opacity-95 active:scale-[0.99] transition-all shadow-xl shadow-[#FF5722]/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          @if (isSubmitting()) {
            <span>Sending Code...</span>
          } @else {
            <span>Send Verification Code</span>
          }
        </button>
      </form>
    </div>
  `
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  isSubmitting = signal<boolean>(false);

  form = this.fb.group({
    email: ['athlete@superfitness.com', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    const email = this.form.value.email!;

    setTimeout(() => {
      const res = this.authService.forgotPassword({ email });
      this.toastService.info(res.message, 'OTP Code Sent');
      this.isSubmitting.set(false);
      this.router.navigate(['/auth/verify-otp'], { queryParams: { email } });
    }, 400);
  }
}
