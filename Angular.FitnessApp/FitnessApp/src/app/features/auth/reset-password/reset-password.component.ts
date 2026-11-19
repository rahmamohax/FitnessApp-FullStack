import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink, ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0D0D12] text-white flex flex-col justify-center p-6 max-w-md mx-auto relative">
      <!-- Back Button -->
      <a routerLink="/auth/login" class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-8 transition-colors">
        <app-icon name="arrow-left" size="16"/>
        <span>Back to Login</span>
      </a>

      <!-- Header matching Figma create password frame -->
      <header class="mb-8 text-center">
        <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-[#FF8A65] flex items-center justify-center text-white shadow-xl shadow-[#FF5722]/30">
          <app-icon name="lock" size="26"/>
        </div>
        <h1 class="text-2xl font-black uppercase tracking-tight text-white mb-2">Create New Password</h1>
        <p class="text-xs text-slate-400 leading-relaxed">
          Your new password must be at least 6 characters and different from previous passwords.
        </p>
      </header>

      <!-- Reset Password Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label for="newPassword" class="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">New Password</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <app-icon name="lock" size="18"/>
            </span>
            <input
              id="newPassword"
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="newPassword"
              placeholder="Enter new password"
              class="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-[#161622] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF5722] transition-colors"
            />
            <button
              type="button"
              (click)="showPassword.update(v => !v)"
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
              aria-label="Toggle password visibility"
            >
              <app-icon [name]="showPassword() ? 'x' : 'target'" size="16"/>
            </button>
          </div>
        </div>

        <div>
          <label for="confirmPassword" class="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Confirm New Password</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <app-icon name="lock" size="18"/>
            </span>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              placeholder="Re-enter new password"
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
            <span>Saving Password...</span>
          } @else {
            <span>Change Password</span>
          }
        </button>
      </form>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  email = signal<string>('athlete@superfitness.com');
  otp = signal<string>('849201');
  showPassword = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const qEmail = this.route.snapshot.queryParamMap.get('email');
    const qOtp = this.route.snapshot.queryParamMap.get('otp');
    if (qEmail) this.email.set(qEmail);
    if (qOtp) this.otp.set(qOtp);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const { newPassword, confirmPassword } = this.form.value;
    if (newPassword !== confirmPassword) {
      this.toastService.error('Passwords do not match.', 'Validation Error');
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      this.authService.resetPassword({
        email: this.email(),
        otp: this.otp(),
        newPassword: newPassword!,
        confirmPassword: confirmPassword!
      });

      this.toastService.success('Your password was updated successfully. Please log in.', 'Success');
      this.isSubmitting.set(false);
      this.router.navigate(['/auth/login']);
    }, 400);
  }
}
