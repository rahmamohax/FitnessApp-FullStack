import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0D0D12] text-white flex flex-col justify-center p-6 max-w-md mx-auto relative">
      <!-- Background Ambient Glow -->
      <div class="absolute -top-20 -left-20 w-72 h-72 bg-[#FF5722]/15 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header with Brand Icon -->
      <header class="mb-6 text-center">
        <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-[#FF8A65] flex items-center justify-center text-white shadow-xl shadow-[#FF5722]/30">
          <app-icon name="dumbbell" size="28"/>
        </div>
        <h1 class="text-2xl font-black uppercase tracking-tight text-white mb-1.5">Create Account</h1>
        <p class="text-xs text-slate-400">Join Super Fitness and unlock your personalized program</p>
      </header>

      <!-- Register Form -->
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-3.5">
        <!-- Names in 2 columns -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="firstName" class="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">First Name</label>
            <input
              id="firstName"
              type="text"
              formControlName="firstName"
              placeholder="e.g. Alex"
              class="w-full px-3.5 py-3 rounded-2xl bg-[#161622] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF5722] transition-colors"
            />
          </div>
          <div>
            <label for="lastName" class="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Last Name</label>
            <input
              id="lastName"
              type="text"
              formControlName="lastName"
              placeholder="e.g. Miller"
              class="w-full px-3.5 py-3 rounded-2xl bg-[#161622] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF5722] transition-colors"
            />
          </div>
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Email Address</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <app-icon name="mail" size="18"/>
            </span>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="athlete@superfitness.com"
              class="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#161622] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF5722] transition-colors"
            />
          </div>
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Password</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <app-icon name="lock" size="18"/>
            </span>
            <input
              id="password"
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password"
              placeholder="At least 6 characters"
              class="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#161622] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF5722] transition-colors"
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

        <!-- Confirm Password -->
        <div>
          <label for="confirmPassword" class="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Confirm Password</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <app-icon name="lock" size="18"/>
            </span>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              placeholder="Re-enter password"
              class="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#161622] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF5722] transition-colors"
            />
          </div>
        </div>

        <!-- Terms Agreement -->
        <div class="flex items-start gap-2 pt-1">
          <input
            id="terms"
            type="checkbox"
            formControlName="terms"
            class="w-4 h-4 mt-0.5 rounded bg-[#161622] border-white/20 text-[#FF5722] focus:ring-[#FF5722] cursor-pointer"
          />
          <label for="terms" class="text-xs text-slate-400 leading-normal cursor-pointer">
            I agree to the <span class="text-white hover:underline">Terms of Service</span> and <span class="text-white hover:underline">Privacy Policy</span>
          </label>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          [disabled]="registerForm.invalid || isSubmitting()"
          class="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white font-bold text-sm hover:opacity-95 active:scale-[0.99] transition-all shadow-xl shadow-[#FF5722]/30 disabled:opacity-50 disabled:cursor-not-allowed mt-3"
        >
          @if (isSubmitting()) {
            <span>Creating Your Account...</span>
          } @else {
            <span>Continue To Personalization</span>
          }
        </button>
      </form>

      <!-- Footer Link -->
      <footer class="mt-6 text-center">
        <p class="text-xs text-slate-400">
          Already have an account?
          <a routerLink="/auth/login" class="text-[#FF5722] font-semibold hover:underline ml-1">Log In</a>
        </p>
      </footer>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  showPassword = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  registerForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    terms: [true, [Validators.requiredTrue]]
  });

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    const { firstName, lastName, email, password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      this.toastService.error('Passwords do not match.', 'Validation Error');
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      this.authService.register({
        firstName: firstName!,
        lastName: lastName!,
        email: email!,
        password: password!
      });

      this.toastService.success('Account created! Let us personalize your fitness plan.', 'Welcome');
      this.isSubmitting.set(false);
      this.router.navigate(['/questionnaire']);
    }, 400);
  }
}
