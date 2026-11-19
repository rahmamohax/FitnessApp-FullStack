import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-verify-otp',
  imports: [RouterLink, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0D0D12] text-white flex flex-col justify-center p-6 max-w-md mx-auto relative">
      <!-- Back Button -->
      <a routerLink="/auth/forgot-password" class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-8 transition-colors">
        <app-icon name="arrow-left" size="16"/>
        <span>Back</span>
      </a>

      <!-- Header matching Figma OTP 2 -->
      <header class="mb-8">
        <div class="w-14 h-14 mb-4 rounded-2xl bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center glow-orange-sm">
          <app-icon name="shield" size="26"/>
        </div>
        <h1 class="text-2xl font-black uppercase tracking-tight text-white mb-2">Verify OTP</h1>
        <p class="text-xs text-slate-400 leading-relaxed">
          We sent a 6-digit confirmation code to
          <span class="text-white font-semibold">{{ email() }}</span>.
          (Demo code: <span class="text-[#FF5722] font-bold">849201</span>)
        </p>
      </header>

      <!-- 6-digit OTP Inputs -->
      <div class="flex items-center justify-between gap-2 mb-6">
        @for (digit of digits(); track $index; let idx = $index) {
          <input
            #otpInput
            type="text"
            maxlength="1"
            inputmode="numeric"
            [value]="digits()[idx]"
            (input)="onDigitInput($event, idx)"
            (keydown)="onKeyDown($event, idx)"
            class="w-12 h-14 text-center text-xl font-bold rounded-2xl bg-[#161622] border border-white/10 text-white focus:outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 transition-all"
          />
        }
      </div>

      <!-- Resend Timer -->
      <div class="flex items-center justify-between text-xs text-slate-400 mb-8">
        <span>Didn't receive code?</span>
        @if (countdown() > 0) {
          <span class="text-slate-500 font-medium">Resend in {{ countdown() }}s</span>
        } @else {
          <button
            type="button"
            (click)="resendCode()"
            class="text-[#FF5722] font-semibold hover:underline"
          >
            Resend Code
          </button>
        }
      </div>

      <!-- Verify Button -->
      <button
        type="button"
        (click)="verify()"
        [disabled]="!isCodeComplete() || isSubmitting()"
        class="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white font-bold text-sm hover:opacity-95 active:scale-[0.99] transition-all shadow-xl shadow-[#FF5722]/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        @if (isSubmitting()) {
          <span>Verifying Code...</span>
        } @else {
          <span>Verify & Continue</span>
        }
      </button>
    </div>
  `
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  email = signal<string>('athlete@superfitness.com');
  digits = signal<string[]>(['8', '4', '9', '2', '0', '1']);
  isSubmitting = signal<boolean>(false);
  countdown = signal<number>(45);
  private timerInterval: any;

  ngOnInit(): void {
    const qEmail = this.route.snapshot.queryParamMap.get('email');
    if (qEmail) {
      this.email.set(qEmail);
    }

    this.timerInterval = setInterval(() => {
      if (this.countdown() > 0) {
        this.countdown.update(c => c - 1);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.slice(-1);
    const current = [...this.digits()];
    current[index] = val;
    this.digits.set(current);

    if (val && index < 5) {
      const nextInput = input.parentElement?.children[index + 1] as HTMLInputElement;
      nextInput?.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.digits()[index] && index > 0) {
      const prevInput = (event.target as HTMLElement).parentElement?.children[index - 1] as HTMLInputElement;
      prevInput?.focus();
    }
  }

  isCodeComplete(): boolean {
    return this.digits().every(d => d.trim().length === 1);
  }

  verify(): void {
    const code = this.digits().join('');
    this.isSubmitting.set(true);

    setTimeout(() => {
      const res = this.authService.verifyOtp({ email: this.email(), otp: code });
      this.isSubmitting.set(false);

      if (res.isSuccess) {
        this.toastService.success('OTP verified successfully!', 'Verified');
        this.router.navigate(['/auth/reset-password'], { queryParams: { email: this.email(), otp: code } });
      } else {
        this.toastService.error(res.message, 'Invalid OTP');
      }
    }, 400);
  }

  resendCode(): void {
    this.countdown.set(60);
    this.authService.forgotPassword({ email: this.email() });
    this.toastService.info('A new OTP was sent: 849201', 'Code Resent');
  }
}
